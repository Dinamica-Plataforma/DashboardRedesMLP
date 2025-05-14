'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataSet, Network, Node, Edge, Options, IdType } from 'vis-network/standalone';
import InfoTable from './InfoTable';

// Rutas a los JSON en public/data
const MATRIX_PATH = '/data/df_temas_matrix.json';
const TYPE_PATH = '/data/df_tipo_vinculo.json';
const TEMPORALIDAD_PATH = '/data/df_temporalidad.json';

type Matrix = { columns: string[]; index: string[]; data: (number | null)[][] };
type TypeMatrix = { data: (string | null)[][] };
type TemporalidadMatrix = { columns: string[]; index: string[]; data: string[][] };

interface NodeInfo {
  nombre: string;
  conexionesEntrantes: number;
  conexionesSalientes: number;
  cb: string;
  evu: string;
  lp: string;
}

const NetworkMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const networkRef = useRef<Network | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const edgesDsRef = useRef<DataSet<Edge> | null>(null);
  const nodesDsRef = useRef<DataSet<Node> | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('todos');
  const [targets, setTargets] = useState<string[]>([]);
  const temporalidadRef = useRef<TemporalidadMatrix | null>(null);
  const matrixRef = useRef<Matrix | null>(null);

  const handleNodeDeselect = () => {
    if (networkRef.current) {
      networkRef.current.unselectAll();
    }
    setSelectedNode(null);
    setIsInfoVisible(false);
  };

  const handleNodeSelect = (nodeId: number, matrix: Matrix, temporalidad: TemporalidadMatrix, inDegree: Record<number, number>, outDegree: Record<number, number>) => {
    const nodeIndex = temporalidad.index.indexOf(matrix.columns[nodeId]);
    
    if (nodeIndex !== -1) {
      // Primero ocultamos la InfoTable
      setIsInfoVisible(false);
      
      // Forzamos un pequeño delay para asegurar la transición
      setTimeout(() => {
        const nodeInfo: NodeInfo = {
          nombre: matrix.columns[nodeId],
          conexionesEntrantes: inDegree[nodeId] || 0,
          conexionesSalientes: outDegree[nodeId] || 0,
          cb: temporalidad.data[nodeIndex][0],
          evu: temporalidad.data[nodeIndex][1],
          lp: temporalidad.data[nodeIndex][2],
        };
        setSelectedNode(nodeInfo);
        // Mostramos la InfoTable con los nuevos datos
        setIsInfoVisible(true);
      }, 50);
    }
  };

  const handleRandomize = () => {
    if (!networkRef.current || !nodesDsRef.current) return;

    // Obtener todos los nodos
    const nodes = nodesDsRef.current.get();
    
    // Generar nuevas posiciones aleatorias
    const newPositions = nodes.map(node => ({
      id: node.id,
      x: Math.random() * 1000 - 500, // Rango de -500 a 500
      y: Math.random() * 1000 - 500  // Rango de -500 a 500
    }));

    // Aplicar las nuevas posiciones
    nodesDsRef.current.update(newPositions);
    
    // Reiniciar la física
    networkRef.current.stabilize(100);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Ocultar tooltip nativo
    const styleEl = document.createElement('style');
    styleEl.textContent = `.vis-tooltip { display: none !important; }`;
    document.head.appendChild(styleEl);

    // Crear tooltip personalizado
    const tooltip = document.createElement('div');
    Object.assign(tooltip.style, {
      position: 'fixed',
      pointerEvents: 'none',
      padding: '8px',
      background: 'rgba(255,255,255,0.95)',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      maxWidth: '200px',
      whiteSpace: 'normal',
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      fontSize: '12px',
      lineHeight: '1.4',
      opacity: '0',
      transition: 'opacity 0.2s ease-in-out',
      display: 'none',
      zIndex: '9999',
    });
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    let lastMousePos = { x: 0, y: 0 };
    let currentEdge: IdType | null = null;
    let animationFrameId: number;
    // eslint-disable-next-line prefer-const
    let hoverTimeout: NodeJS.Timeout | null = null;
    let hideTimeout: NodeJS.Timeout | null = null;
    let lastEdgeId: IdType | null = null;
    let isHovering = false;

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const showTooltip = (edge: Edge) => {
      if (!tooltipRef.current) return;
      
      // Limpiar timeouts existentes
      if (hoverTimeout) clearTimeout(hoverTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
      
      isHovering = true;
      tooltipRef.current.innerHTML = edge.title as string;
      tooltipRef.current.style.display = 'block';
      tooltipRef.current.style.opacity = '1';
    };

    const hideTooltip = () => {
      if (!tooltipRef.current) return;
      
      isHovering = false;
      tooltipRef.current.style.opacity = '0';
      hideTimeout = setTimeout(() => {
        if (!isHovering && tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
      }, 200);
    };

    const detectLoop = () => {
      if (!containerRef.current || !networkRef.current || !tooltipRef.current || !edgesDsRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const xCanvas = lastMousePos.x - rect.left;
      const yCanvas = lastMousePos.y - rect.top;

      if (xCanvas >= 0 && yCanvas >= 0 && xCanvas <= rect.width && yCanvas <= rect.height) {
        const nodeId = networkRef.current.getNodeAt({ x: xCanvas, y: yCanvas });
        
        if (nodeId !== undefined) {
          if (currentEdge !== null) {
            currentEdge = null;
            lastEdgeId = null;
            hideTooltip();
          }
        } else {
          const edgeId = networkRef.current.getEdgeAt({ x: xCanvas, y: yCanvas });
          
          if (edgeId !== undefined) {
            if (edgeId !== lastEdgeId) {
              lastEdgeId = edgeId;
              currentEdge = edgeId;
              const edge = edgesDsRef.current.get(edgeId);
              if (edge) {
                showTooltip(edge);
              }
            }
            
            // Actualizar posición del tooltip
            if (tooltipRef.current) {
              const m = 10;
              let tx = lastMousePos.x + m;
              let ty = lastMousePos.y + m;
              const tRect = tooltipRef.current.getBoundingClientRect();
              if (tx + tRect.width > window.innerWidth) tx = lastMousePos.x - tRect.width - m;
              if (ty + tRect.height > window.innerHeight) ty = lastMousePos.y - tRect.height - m;
              tooltipRef.current.style.left = `${tx}px`;
              tooltipRef.current.style.top = `${ty}px`;
            }
          } else if (currentEdge !== null) {
            currentEdge = null;
            lastEdgeId = null;
            hideTooltip();
          }
        }
      } else if (currentEdge !== null) {
        currentEdge = null;
        lastEdgeId = null;
        hideTooltip();
      }
      
      animationFrameId = requestAnimationFrame(detectLoop);
    };

    const options: Options = {
      nodes: { 
        font: { 
            size: 15,
            face: 'ui-sans-serif, system-ui',
            strokeColor: '#ffffff',
            strokeWidth: 1.5
        } 
      },
      edges: {
        color: {
          color: '#a1a1a1',
          hover: '#2a5159',
          highlight: '#15292d',
          inherit: false
        },
        arrows: { to: { enabled: true, scaleFactor: 1 } },
        scaling: {
          min: 1,
          max: 3,
          label: { enabled: true, min: 14, max: 30, maxVisible: 30, drawThreshold: 5 },
        },
        hoverWidth: 0,
        selectionWidth: 0
      },
      physics: {
        // 🔄 Selecciona el solver "repulsion"
        solver: 'repulsion',
        stabilization: {
          enabled: true,
          iterations: 200,
          updateInterval: 50,
          fit: true,
        },
        // ⚙️ Parámetros propios de repulsion
        repulsion: {
          nodeDistance: 130,    // distancia mínima en px entre nodos
          centralGravity: 0.2,  // opcional: para centrar ligeramente
          springLength: 300,    // resorte virtual para "rebote"
          springConstant: 0.01, // rigidez del resorte
        },
      },
      interaction: { 
        hover: true,
        selectable: true,
        selectConnectedEdges: true,
        multiselect: false,
        hoverConnectedEdges: true,
        zoomView: true,
        dragView: true
      },
      manipulation: {
        enabled: false
      }
    };

    Promise.all([
      fetch(MATRIX_PATH).then(r => r.json()),
      fetch(TYPE_PATH).then(r => r.json()),
      fetch(TEMPORALIDAD_PATH).then(r => r.json()),
    ])
      .then(([matrix, typeMatrix, temporalidad]: [Matrix, TypeMatrix, TemporalidadMatrix]) => {
        // Guardar matrix en la ref
        matrixRef.current = matrix;

        // Extraer targets únicos
        const uniqueTargets = Array.from(new Set(matrix.columns)).sort();
        setTargets(['todos', ...uniqueTargets]);

        // Guardar temporalidad en la ref
        temporalidadRef.current = temporalidad;

        // Mapeo de ancho por nivel de vínculo
        const widthByLevel: Record<number, number> = { 1: 2, 2: 4, 3: 6 };

        // Calcular grado entrante y saliente
        const inDegree: Record<number, number> = {};
        const outDegree: Record<number, number> = {};
        const edges: Edge[] = [];

        matrix.data.forEach((row, i) => {
          row.forEach((w, j) => {
            if (w && w > 0) {
              inDegree[j] = (inDegree[j] || 0) + 1;
              outDegree[i] = (outDegree[i] || 0) + 1;
              const tipo = typeMatrix.data[i][j] || '-';
              const nivelNum = w;
              const nivelText = nivelNum === 1 ? 'Bajo' : nivelNum === 2 ? 'Medio' : 'Alto';

              edges.push({
                from: i,
                to: j,
                arrows: { to: true },
                value: widthByLevel[nivelNum] || 2,
                smooth: { enabled: true, type: 'dynamic', roundness: 0.5 },
                title:
                  `<strong>Desde:</strong> ${matrix.columns[i]}<br/>` +
                  `<strong>Hasta:</strong> ${matrix.columns[j]}<br/>` +
                  `<strong>Nivel de vínculo:</strong> ${nivelText}<br/>` +
                  `<strong>Tipo de vínculo:</strong> ${tipo}`,
              });
            }
          });
        });

        // Crear nodos con color y tamaño según grado entrante
        const nodes: Node[] = matrix.columns.map((label, idx) => {
          const degree = inDegree[idx] || 0;
          const size = 16 + degree * 1.5;
          
          const maxSize = 16 + Math.max(...Object.values(inDegree)) * 1.5;
          const minSize = 16;
          const ratio = (size - minSize) / (maxSize - minSize);
          
          const r = Math.round(24 + (230 - 24) * ratio);
          const g = Math.round(97 + (57 - 97) * ratio);
          const b = Math.round(112 + (70 - 112) * ratio);
          
          return {
            id: idx,
            label,
            shape: 'dot',
            color: { 
              background: `rgb(${r},${g},${b})`,
              border: `rgb(${r},${g},${b})`
            },
            size: size,
          };
        });

        const nodesDs = new DataSet(nodes);
        nodesDsRef.current = nodesDs;
        const edgesDs = new DataSet(edges);
        edgesDsRef.current = edgesDs;

        // Inicializar red
        const network = new Network(
          containerRef.current!,
          { nodes: nodesDs, edges: edgesDs },
          options
        );
        networkRef.current = network;

        // Configurar límites de zoom y movimiento
        let isZooming = false;
        network.on('zoom', (params) => {
          if (isZooming) return;
          
          const currentZoom = params.scale;
          if (currentZoom < 0.5 || currentZoom > 2) {
            isZooming = true;
            network.moveTo({ 
              scale: currentZoom < 0.5 ? 0.5 : 2,
              animation: {
                duration: 200,
                easingFunction: 'easeInOutQuad'
              }
            });
            setTimeout(() => {
              isZooming = false;
            }, 200);
          }
        });

        // Limitar el movimiento del mapa
        network.on('dragEnd', () => {
          const view = network.getViewPosition();
          const scale = network.getScale();
          const containerWidth = containerRef.current?.clientWidth || 0;
          const containerHeight = containerRef.current?.clientHeight || 0;
          
          // Calcular límites basados en el zoom actual
          const maxX = containerWidth * scale;
          const maxY = containerHeight * scale;
          
          // Ajustar la posición si está fuera de los límites
          if (Math.abs(view.x) > maxX || Math.abs(view.y) > maxY) {
            network.moveTo({
              position: {
                x: Math.max(-maxX, Math.min(maxX, view.x)),
                y: Math.max(-maxY, Math.min(maxY, view.y))
              },
              animation: {
                duration: 200,
                easingFunction: 'easeInOutQuad'
              }
            });
          }
        });

        // Manejar clic en nodo
        network.on('click', (params) => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            // Si es el mismo nodo, deseleccionarlo
            if (selectedNode && selectedNode.nombre === matrix.columns[nodeId]) {
              handleNodeDeselect();
            } else {
              // Si es un nodo diferente, seleccionarlo
              handleNodeSelect(nodeId, matrix, temporalidad, inDegree, outDegree);
            }
          } else {
            handleNodeDeselect();
          }
        });

        // Manejar doble clic en nodo
        network.on('doubleClick', (params) => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            // Si es el mismo nodo, deseleccionarlo
            if (selectedNode && selectedNode.nombre === matrix.columns[nodeId]) {
              handleNodeDeselect();
            } else {
              // Si es un nodo diferente, seleccionarlo
              handleNodeSelect(nodeId, matrix, temporalidad, inDegree, outDegree);
            }
          }
        });

        // Eliminar el manejador de deselección ya que lo manejamos en el clic
        network.off('deselectNode');

        detectLoop();
      })
      .catch(console.error);

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (hoverTimeout) clearTimeout(hoverTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
      if (tooltipRef.current) {
        document.body.removeChild(tooltipRef.current);
      }
      if (styleEl) {
        document.head.removeChild(styleEl);
      }
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTargetChange = (target: string) => {
    if (!networkRef.current || !nodesDsRef.current || !edgesDsRef.current || !matrixRef.current || !temporalidadRef.current) return;

    setSelectedTarget(target);
    
    // Obtener todos los nodos y aristas
    const nodes = nodesDsRef.current.get();
    const edges = edgesDsRef.current.get();
    const matrix = matrixRef.current;

    if (target === 'todos') {
      // Mostrar todos los nodos y aristas
      nodesDsRef.current.update(nodes.map(node => ({ ...node, hidden: false })));
      edgesDsRef.current.update(edges.map(edge => ({ ...edge, hidden: false })));
    } else {
      // Encontrar el índice del target seleccionado
      const targetIndex = matrix.columns.indexOf(target);
      
      // Filtrar nodos y aristas
      const filteredNodes = nodes.map(node => ({
        ...node,
        hidden: node.id !== targetIndex && !matrix.data[node.id as number][targetIndex]
      }));
      
      const filteredEdges = edges.map(edge => ({
        ...edge,
        hidden: edge.from !== targetIndex && edge.to !== targetIndex
      }));

      nodesDsRef.current.update(filteredNodes);
      edgesDsRef.current.update(filteredEdges);
    }

    // Reajustar la vista
    networkRef.current.fit({
      animation: {
        duration: 500,
        easingFunction: 'easeInOutQuad'
      }
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <select
          value={selectedTarget}
          onChange={(e) => handleTargetChange(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm hover:border-[#186170] focus:outline-none focus:ring-2 focus:ring-[#186170] focus:border-transparent min-w-[200px]"
        >
          {targets.map((target) => (
            <option key={target} value={target}>
              {target === 'todos' ? 'Todos los tópicos' : target}
            </option>
          ))}
        </select>
        <button
          onClick={handleRandomize}
          className="bg-[#186170] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#186170]/90 transition-colors duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <InfoTable 
        data={selectedNode}
        isVisible={isInfoVisible}
        onClose={handleNodeDeselect}
      />
    </div>
  );
};

export default NetworkMap;
