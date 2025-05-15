'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataSet, Network, Node, Edge, Options, IdType } from 'vis-network/standalone';
import InfoTable from './InfoTable';

// Rutas a los JSON en public/data
const MATRIX_PATH = '/data/df_temas_matrix.json';
const TYPE_PATH = '/data/df_tipo_vinculo.json';
const TEMPORALIDAD_PATH = '/data/df_temporalidad.json';
const DESCRIPTIONS_PATH = '/data/df_descriptions.json';
const DESCRIPTIONS_LT_PATH = '/data/df_descriptions_lt.json';

type Matrix = { columns: string[]; index: string[]; data: (number | null)[][] };
type TypeMatrix = { data: (string | null)[][] };
type TemporalidadMatrix = { columns: string[]; index: string[]; data: string[][] };
type DescriptionsMatrix = { columns: string[]; index: string[]; data: string[][] };
type DescriptionsLTMatrix = { columns: string[]; index: string[]; data: string[][] };

interface NodeInfo {
  nombre: string;
  conexionesEntrantes: number;
  conexionesSalientes: number;
  cb: string;
  evu: string;
  lp: string;
  descripcion?: string;
  cb_description?: string;
  evu_description?: string;
  lp_description?: string;
}

// Constantes para el desplazamiento y animación
const INFO_TABLE_EFFECTIVE_WIDTH_PX = 300; // Ancho estimado en píxeles del InfoTable
const ANIMATION_DURATION = 300;
const EASING_FUNCTION = 'easeInOutQuad';

const NetworkMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialPositionsRef = useRef<Record<IdType, {x: number, y: number}> | null>(null);
  const networkInitializedRef = useRef(false);
  const physicsEnabledRef = useRef(true);
  const descriptionsLTRef = useRef<DescriptionsLTMatrix | null>(null);

  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const selectedNodeRef = useRef(selectedNode);
  useEffect(() => { selectedNodeRef.current = selectedNode; }, [selectedNode]);

  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const isInfoVisibleRef = useRef(isInfoVisible);
  useEffect(() => { isInfoVisibleRef.current = isInfoVisible; }, [isInfoVisible]);

  const [isPanelCausingShift, setIsPanelCausingShift] = useState(false);
  const isPanelCausingShiftRef = useRef(isPanelCausingShift);
  useEffect(() => { isPanelCausingShiftRef.current = isPanelCausingShift; }, [isPanelCausingShift]);

  // Estado para mantener el ancho actual del InfoTable
  const [infoTableWidth, setInfoTableWidth] = useState(INFO_TABLE_EFFECTIVE_WIDTH_PX);
  const infoTableWidthRef = useRef(infoTableWidth);
  useEffect(() => { infoTableWidthRef.current = infoTableWidth; }, [infoTableWidth]);

  const networkRef = useRef<Network | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const edgesDsRef = useRef<DataSet<Edge> | null>(null);
  const nodesDsRef = useRef<DataSet<Node> | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('todos');
  const [targets, setTargets] = useState<string[]>([]);
  const temporalidadRef = useRef<TemporalidadMatrix | null>(null);
  const matrixRef = useRef<Matrix | null>(null);
  const descriptionsRef = useRef<DescriptionsMatrix | null>(null);

  const performDeselectActions = (shouldMoveMap: boolean) => {
    if (networkRef.current && shouldMoveMap) {
      const currentPosition = networkRef.current.getViewPosition();
      const currentScale = networkRef.current.getScale();
      // Evitar división por cero o escalas extremadamente pequeñas si la librería lo permitiera
      const safeScale = Math.max(currentScale, 0.01); 
      const shiftInCanvasCoordinates = (INFO_TABLE_EFFECTIVE_WIDTH_PX / 2) / safeScale;
      
      networkRef.current.moveTo({
        position: { x: currentPosition.x + shiftInCanvasCoordinates, y: currentPosition.y },
        animation: { duration: ANIMATION_DURATION, easingFunction: EASING_FUNCTION },
      });
      setIsPanelCausingShift(false);
    }
    if (networkRef.current) {
      networkRef.current.unselectAll();
    }
    setSelectedNode(null);
    setIsInfoVisible(false);
  };
  
  const handleNodeDeselect = () => { // Usada por InfoTable onClose
    performDeselectActions(isPanelCausingShift); // Accede al estado isPanelCausingShift directamente
  };

  // Esta función es llamada desde los callbacks de la red, usa refs para estados que lee.
  const handleNodeSelectInternal = (nodeId: number, matrix: Matrix, temporalidad: TemporalidadMatrix, inDegree: Record<number, number>, outDegree: Record<number, number>) => {
    const nodeIndex = temporalidad.index.indexOf(matrix.columns[nodeId]);
    if (nodeIndex !== -1) {
      const panelWasVisible = isInfoVisibleRef.current;
      const MismoNodoSeleccionado = selectedNodeRef.current?.nombre === matrix.columns[nodeId];

      if (panelWasVisible && MismoNodoSeleccionado) {
        networkRef.current?.selectNodes([nodeId], false);
        return;
      }
      
      if (panelWasVisible && !MismoNodoSeleccionado) {
        setIsInfoVisible(false);
      }
      
      setTimeout(() => {
        const nodeInfo: NodeInfo = {
          nombre: matrix.columns[nodeId],
          conexionesEntrantes: inDegree[nodeId] || 0,
          conexionesSalientes: outDegree[nodeId] || 0,
          cb: temporalidad.data[nodeIndex][0],
          evu: temporalidad.data[nodeIndex][1],
          lp: temporalidad.data[nodeIndex][2],
          descripcion: descriptionsRef.current?.data[nodeIndex]?.[0] || undefined,
          cb_description: descriptionsLTRef.current?.data[nodeIndex]?.[0] || undefined,
          evu_description: descriptionsLTRef.current?.data[nodeIndex]?.[1] || undefined,
          lp_description: descriptionsLTRef.current?.data[nodeIndex]?.[2] || undefined
        };
        setSelectedNode(nodeInfo);
        setIsInfoVisible(true);

        if (networkRef.current && !panelWasVisible) {
          const currentPosition = networkRef.current.getViewPosition();
          const currentScale = networkRef.current.getScale();
          const safeScale = Math.max(currentScale, 0.01);
          const shiftInCanvasCoordinates = (INFO_TABLE_EFFECTIVE_WIDTH_PX / 2) / safeScale;

          networkRef.current.moveTo({
            position: { x: currentPosition.x - shiftInCanvasCoordinates, y: currentPosition.y },
            animation: { duration: ANIMATION_DURATION, easingFunction: EASING_FUNCTION },
          });
          setIsPanelCausingShift(true);
        }
      }, 50);
    }
  };

  const handleReset = () => {
    if (!networkRef.current || !nodesDsRef.current || !edgesDsRef.current || !initialPositionsRef.current) return;

    // Guardar los nodos seleccionados antes de reiniciar
    const currentSelectedNodes = networkRef.current.getSelectedNodes();

    // Quitar filtros si están aplicados
    if (selectedTarget !== 'todos') {
      setSelectedTarget('todos');
      
      // Restaurar todos los nodos y aristas
      if (nodesDsRef.current && edgesDsRef.current) {
        const nodes = nodesDsRef.current.get();
        const edges = edgesDsRef.current.get();
        
        nodesDsRef.current.update(nodes.map(node => ({
          ...node,
          hidden: false,
          color: {
            background: '#78c7c9',
            border: '#78c7c9',
            hover: {
              background: '#3C9CAA',
              border: '#3C9CAA',
            },
            highlight: {
              background: '#00718b',
              border: '#00718b',
            }
          }
        })));
        
        edgesDsRef.current.update(edges.map(edge => ({
          ...edge,
          hidden: false
        })));
      }
    }

    // Desactivar la física temporalmente mientras reposicionamos
    networkRef.current.setOptions({ physics: { enabled: false } });
    
    // Obtener las conexiones actuales
    const edges = edgesDsRef.current.get();

    // Actualizar posiciones de nodos
    const nodes = nodesDsRef.current.get();
    const updatedNodes = nodes.map(node => ({
      ...node,
      x: initialPositionsRef.current?.[node.id as IdType]?.x,
      y: initialPositionsRef.current?.[node.id as IdType]?.y
    }));

    // Limpiar el DataSet completamente
    nodesDsRef.current.clear();
    edgesDsRef.current.clear();

    // Volver a añadir nodos y conexiones
    nodesDsRef.current.add(updatedNodes);
    edgesDsRef.current.add(edges);

    // Forzar una actualización completa
    networkRef.current.setData({
      nodes: nodesDsRef.current,
      edges: edgesDsRef.current
    });

    // Forzar actualización visual
    networkRef.current.redraw();

    // Ajustar el zoom como al inicio
    networkRef.current.fit({
      nodes: nodes.map(node => node.id),
      animation: false
    });
    const scale = networkRef.current.getScale() * 0.7;
    
    // Verificar si el InfoTable está abierto
    if (isInfoVisibleRef.current) {
      // Obtener la posición centrada natural
      const currentPosition = networkRef.current.getViewPosition();
      
      // Usar el ancho actual del InfoTable para calcular el desplazamiento
      const infoTableOffset = infoTableWidthRef.current;
      
      // Desplazar la vista hacia la derecha para compensar el InfoTable
      networkRef.current.moveTo({
        position: { 
          x: currentPosition.x - infoTableOffset,
          y: currentPosition.y 
        },
        scale: scale,
        animation: {
          duration: ANIMATION_DURATION,
          easingFunction: EASING_FUNCTION
        }
      });
    } else {
      // Si no hay InfoTable, solo aplicamos el zoom
      networkRef.current.moveTo({
        scale: scale,
        animation: false
      });
    }

    // Restaurar la selección de nodos si había alguno seleccionado
    if (currentSelectedNodes.length > 0) {
      networkRef.current.selectNodes(currentSelectedNodes);
    }

    // Reactivar la física inmediatamente
    networkRef.current.setOptions({
      physics: {
        enabled: true,
        solver: 'repulsion',
        stabilization: {
          enabled: true,
          iterations: 200,
          updateInterval: 50,
          fit: true
        },
        repulsion: {
          nodeDistance: 130,
          centralGravity: 0.2,
          springLength: 300,
          springConstant: 0.01
        }
      }
    });
    physicsEnabledRef.current = true;
  };

  const handleRandomize = () => {
    if (!networkRef.current || !nodesDsRef.current || !edgesDsRef.current) return;

    // Activar la física
    networkRef.current.setOptions({
      physics: {
        enabled: true,
        solver: 'repulsion',
        stabilization: {
          enabled: true,
          iterations: 200,
          updateInterval: 50,
          fit: true
        },
        repulsion: {
          nodeDistance: 130,
          centralGravity: 0.2,
          springLength: 300,
          springConstant: 0.01
        }
      }
    });
    physicsEnabledRef.current = true;

    // Obtener las conexiones actuales
    const edges = edgesDsRef.current.get();

    // Generar nuevas posiciones aleatorias
    const nodes = nodesDsRef.current.get();
    const randomizedNodes = nodes.map(node => ({
      ...node,
      x: Math.random() * 1000 - 500,
      y: Math.random() * 1000 - 500
    }));

    // Limpiar y recargar los datos
    nodesDsRef.current.clear();
    edgesDsRef.current.clear();
    nodesDsRef.current.add(randomizedNodes);
    edgesDsRef.current.add(edges);

    // Actualizar la red
    networkRef.current.setData({
      nodes: nodesDsRef.current,
      edges: edgesDsRef.current
    });

    // Ajustar el zoom como al inicio
    networkRef.current.fit({
      nodes: nodes.map(node => node.id),
      animation: false
    });
    const scale = networkRef.current.getScale() * 0.7;
    networkRef.current.moveTo({
      scale: scale,
      animation: false
    });

    networkRef.current.stabilize(100);
  };

  useEffect(() => {
    if (!containerRef.current || networkInitializedRef.current) return;
    networkInitializedRef.current = true;

    // Variables para el tooltip
    let lastMousePos = { x: 0, y: 0 };
    let currentEdge: IdType | null = null;
    const hoverTimeout: NodeJS.Timeout | null = null;
    let hideTimeout: NodeJS.Timeout | null = null;
    let lastEdgeId: IdType | null = null;
    let isHovering = false;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos = { x: e.clientX, y: e.clientY };
      if (currentEdge && tooltipRef.current) {
        tooltipRef.current.style.left = `${e.clientX + 5}px`;
        tooltipRef.current.style.top = `${e.clientY + 5}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const showTooltip = (edge: Edge) => {
      if (!tooltipRef.current) return;
      
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

    // Inicializar la red después de cargar todos los datos
    Promise.all([
      fetch('/data/node_positions.json').then(r => r.json()).catch(() => null),
      fetch(MATRIX_PATH).then(r => r.json()),
      fetch(TYPE_PATH).then(r => r.json()),
      fetch(TEMPORALIDAD_PATH).then(r => r.json()),
      fetch(DESCRIPTIONS_PATH).then(r => r.json()),
      fetch(DESCRIPTIONS_LT_PATH).then(r => r.json()),
    ])
      .then(([positions, matrix, typeMatrix, temporalidad, descriptions, descriptionsLT]: [Record<IdType, {x: number, y: number}> | null, Matrix, TypeMatrix, TemporalidadMatrix, DescriptionsMatrix, DescriptionsLTMatrix]) => {
        // Guardar datos en refs
        matrixRef.current = matrix;
        temporalidadRef.current = temporalidad;
        descriptionsRef.current = descriptions;
        descriptionsLTRef.current = descriptionsLT;
        initialPositionsRef.current = positions;

        // Configurar targets
        const uniqueTargets = Array.from(new Set(matrix.columns)).sort((a, b) => 
          a.localeCompare(b, undefined, { sensitivity: 'base' })
        );
        setTargets(['todos', ...uniqueTargets]);

        // Preparar edges y calcular grados
        const opacityByLevel: Record<number, number> = { 1: 0.2, 2: 0.6, 3: 1.0 };
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
              const nivelWeight = nivelNum === 1 ? '400' : nivelNum === 2 ? '600' : '800';
              edges.push({
                from: i,
                to: j,
                color: { color: '#575756', opacity: opacityByLevel[nivelNum] || 1.0 },
                smooth: { enabled: true, type: 'dynamic', roundness: 0.5 },
                title: `<div style="color: #575756;">
                         <strong>Desde:</strong> ${matrix.columns[i]}<br/>
                         <strong>Hasta:</strong> ${matrix.columns[j]}<br/>
                         <strong>Nivel de vínculo:</strong> <span style="font-weight: ${nivelWeight};">${nivelText}</span><br/>
                         <strong>Tipo de vínculo:</strong> ${tipo}
                       </div>`,
              });
            }
          });
        });

        // Crear nodos
        const nodes: Node[] = matrix.columns.map((label, idx) => {
          const degree = outDegree[idx] || 0;
          const size = 5 + degree * 3.5;
          const position = positions ? positions[idx.toString() as IdType] : undefined;
          
          return {
            id: idx,
            label,
            shape: 'dot',
            x: position?.x,
            y: position?.y,
            color: { background: '#78c7c9', border: '#78c7c9' },
            size: size,
          };
        });

        // Crear datasets
        const nodesDs = new DataSet(nodes);
        nodesDsRef.current = nodesDs;
        const edgesDs = new DataSet(edges);
        edgesDsRef.current = edgesDs;

        // Configuración de la red
        const options: Options = {
          nodes: {
            font: {
              size: 20,
              strokeColor: '#f4f5f7',
              strokeWidth: 4,
              multi: true,
              color: '#575756'
            },
            color: {
              background: '#78c7c9',
              border: '#78c7c9',
              hover: {
                background: '#3C9CAA',
                border: '#3C9CAA',
              },
              highlight: {
                background: '#00718b',
                border: '#00718b',
              },
            },
            widthConstraint: { maximum: 250 },
            fixed: false
          },
          edges: {
            color: {
              color: '#575756',
              hover: '#00718b',
              highlight: '#d51224',
              inherit: false
            },
            arrows: {
              from: { enabled: false },
              middle: { enabled: false },
              to: {
                enabled: true,
                scaleFactor: 1,
                type: 'vee'
              }
            },
            width: 2,
            hoverWidth: 0,
            selectionWidth: 0
          },
          physics: {
            enabled: true,
            solver: 'repulsion',
            stabilization: {
              enabled: true,
              iterations: 200,
              updateInterval: 50,
              fit: true
            },
            repulsion: {
              nodeDistance: 130,
              centralGravity: 0.2,
              springLength: 300,
              springConstant: 0.01
            }
          },
          interaction: {
            hover: true,
            selectable: true,
            selectConnectedEdges: true,
            multiselect: false,
            hoverConnectedEdges: true,
            zoomView: true,
            dragView: true,
            dragNodes: true
          }
        };

        // Inicializar red
        const network = new Network(containerRef.current!, { nodes: nodesDs, edges: edgesDs }, options);
        networkRef.current = network;

        // Ajustar la vista inicial con margen
        network.once('stabilizationIterationsDone', () => {
          const nodePositions = network.getPositions();
          // Primero calculamos la escala que necesitamos
          network.fit({
            nodes: Object.keys(nodePositions).map(id => parseInt(id)),
            animation: false
          });
          const scale = network.getScale() * 0.7; // Reducimos el zoom un 20% para dar margen
          
          // Aplicamos el zoom final directamente
          network.moveTo({
            scale: scale,
            animation: false
          });
        });

        // Configurar límites de zoom
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
          const containerWidth = containerRef.current?.clientWidth || 0;
          const containerHeight = containerRef.current?.clientHeight || 0;
          
          // Calcular límites basados en el zoom actual
          const maxX = containerWidth * 0.5;
          const maxY = containerHeight * 0.5;
          
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

        // Añadir evento para reactivar las físicas cuando se mueva un nodo
        network.on('dragStart', () => {
          if (!physicsEnabledRef.current) {
            network.setOptions({
              physics: {
                enabled: true,
                solver: 'repulsion',
                stabilization: {
                  enabled: true,
                  iterations: 200,
                  updateInterval: 50,
                  fit: true
                },
                repulsion: {
                  nodeDistance: 130,
                  centralGravity: 0.2,
                  springLength: 300,
                  springConstant: 0.01
                }
              }
            });
            physicsEnabledRef.current = true;
          }
        });

        // Configurar eventos de la red
        network.on('click', (params) => {
          const currentMatrix = matrixRef.current;
          const currentTemporalidad = temporalidadRef.current;
          if (!currentMatrix || !currentTemporalidad) return;

          // Los grados inDegree y outDegree se calculan una vez en el scope del useEffect principal
          // y se capturan aquí. Deberían ser los correctos para la red actual.
          
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0] as number;
            // Usar selectedNodeRef para obtener el estado actual del nodo seleccionado
            if (selectedNodeRef.current && selectedNodeRef.current.nombre === currentMatrix.columns[nodeId]) {
              // Clic en el mismo nodo seleccionado -> deseleccionar
              performDeselectActions(isPanelCausingShiftRef.current); // Usa el valor del ref
            } else {
              // Clic en un nodo diferente (o ningún nodo seleccionado previamente) -> seleccionar
              handleNodeSelectInternal(nodeId, currentMatrix, currentTemporalidad, inDegree, outDegree);
            }
          } else {
            // Clic fuera de cualquier nodo -> deseleccionar
            performDeselectActions(isPanelCausingShiftRef.current); // Usa el valor del ref
          }
        });

        network.on('doubleClick', (params) => {
          const currentMatrix = matrixRef.current;
          const currentTemporalidad = temporalidadRef.current;
          if (!currentMatrix || !currentTemporalidad) return;

          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0] as number;
            if (selectedNodeRef.current && selectedNodeRef.current.nombre === currentMatrix.columns[nodeId]) {
              // Doble clic en el mismo nodo -> deseleccionar
              performDeselectActions(isPanelCausingShiftRef.current); // Usa el valor del ref
            } else {
              // Doble clic en un nodo diferente -> seleccionar
              handleNodeSelectInternal(nodeId, currentMatrix, currentTemporalidad, inDegree, outDegree);
            }
          }
          // Doble clic fuera no deselecciona explícitamente aquí
        });

        // Eliminar el manejador de deselección ya que lo manejamos en el clic
        network.off('deselectNode');

        // Iniciar loop de detección
        detectLoop();
      })
      .catch(error => {
        console.error('Error inicializando la red:', error);
      });

    // Cleanup function
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
      if (tooltipRef.current) {
        document.body.removeChild(tooltipRef.current);
      }
      if (styleEl) {
        document.head.removeChild(styleEl);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // Solo se ejecuta una vez al montar

  const handleTargetChange = (target: string) => {
    if (!networkRef.current || !nodesDsRef.current || !edgesDsRef.current || !matrixRef.current || !temporalidadRef.current) return;

    setSelectedTarget(target);
    
    const nodes = nodesDsRef.current.get();
    const edges = edgesDsRef.current.get();
    const matrix = matrixRef.current;

    const defaultNodeBackgroundColor = '#78c7c9';
    const defaultNodeBorderColor = '#78c7c9';
    const targetNodeColorValue = '#d51224';

    // Colores personalizados para hover y highlight del nodo filtrado
    const targetNodeHoverBackgroundColor = '#b2101f';
    const targetNodeHoverBorderColor = '#b2101f';
    const targetNodeHighlightBackgroundColor = '#7d0d18';
    const targetNodeHighlightBorderColor = '#7d0d18';

    // Colores globales de hover y highlight (de options.nodes.color)
    const globalNodeHoverBackgroundColor = '#3C9CAA';
    const globalNodeHoverBorderColor = '#3C9CAA';
    const globalNodeHighlightBackgroundColor = '#00718b';
    const globalNodeHighlightBorderColor = '#00718b';

    const defaultNodeColorConfig = {
      background: defaultNodeBackgroundColor,
      border: defaultNodeBorderColor,
      hover: {
        background: globalNodeHoverBackgroundColor,
        border: globalNodeHoverBorderColor,
      },
      highlight: {
        background: globalNodeHighlightBackgroundColor,
        border: globalNodeHighlightBorderColor,
      }
    };

    if (target === 'todos') {
      nodesDsRef.current.update(nodes.map(node => ({
        ...node,
        hidden: false,
        color: defaultNodeColorConfig
      })));
      edgesDsRef.current.update(edges.map(edge => ({ ...edge, hidden: false })));
    } else {
      const targetIndex = matrix.columns.indexOf(target);
      
      const filteredNodes = nodes.map(node => {
        const isTargetNode = node.id === targetIndex;
        let nodeColorConfig;

        if (isTargetNode) {
          nodeColorConfig = {
            background: targetNodeColorValue,
            border: targetNodeColorValue,
            hover: {
              background: targetNodeHoverBackgroundColor,
              border: targetNodeHoverBorderColor,
            },
            highlight: {
              background: targetNodeHighlightBackgroundColor,
              border: targetNodeHighlightBorderColor,
            }
          };
        } else {
          nodeColorConfig = defaultNodeColorConfig;
        }
        
        return {
          ...node,
          hidden: node.id !== targetIndex && 
                  !matrix.data[node.id as number][targetIndex] && 
                  !matrix.data[targetIndex][node.id as number],
          color: nodeColorConfig
        };
      });
      
      const filteredEdges = edges.map(edge => ({
        ...edge,
        hidden: edge.from !== targetIndex && edge.to !== targetIndex
      }));

      nodesDsRef.current.update(filteredNodes);
      edgesDsRef.current.update(filteredEdges);
    }

    // Enfoque mejorado para el centrado
    
    // 1. Primero, permitir que la red se centre naturalmente en los nodos visibles
    const visibleNodeIds = nodes
      .filter(node => !nodesDsRef.current?.get(node.id)?.hidden)
      .map(node => node.id);
    
    if (visibleNodeIds.length === 0) return;
    
    // Ajustar el zoom para ver todos los nodos visibles
    networkRef.current.fit({
      nodes: visibleNodeIds,
      animation: false
    });
    
    // Obtener la escala deseada
    const scale = networkRef.current.getScale() * 0.8;
    
    // Verificar si el InfoTable está abierto
    if (isInfoVisibleRef.current) {
      // En lugar de calcular un centro absoluto, obtenemos la posición actual
      // y aplicamos un offset para compensar el espacio del InfoTable
      const currentPosition = networkRef.current.getViewPosition();
      
      // Usar el ancho actual del InfoTable para calcular el desplazamiento
      const infoTableOffset = infoTableWidthRef.current;
      
      // Desplazar la vista hacia la derecha para compensar el InfoTable
      networkRef.current.moveTo({
        position: { 
          x: currentPosition.x - infoTableOffset/2,
          y: currentPosition.y 
        },
        scale: scale,
        animation: {
          duration: ANIMATION_DURATION,
          easingFunction: EASING_FUNCTION
        }
      });
    } else {
      // Si no hay InfoTable, solo aplicamos el zoom
      networkRef.current.moveTo({
        scale: scale,
        animation: {
          duration: ANIMATION_DURATION,
          easingFunction: EASING_FUNCTION
        }
      });
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <button
          onClick={handleReset}
          className="bg-[#00718b] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#00718b]/90 transition-colors duration-200 flex items-center space-x-2"
          title="Restaurar disposición inicial de nodos"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span>Reiniciar</span>
        </button>
        <button
          onClick={handleRandomize}
          className="bg-[#00718b] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#00718b]/90 transition-colors duration-200 flex items-center space-x-2"
          title="Reordenar nodos aleatoriamente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Reordenar</span>
        </button>
        <select
          value={selectedTarget}
          onChange={(e) => handleTargetChange(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm hover:border-[#00718b] focus:outline-none focus:ring-2 focus:ring-[#186170] focus:border-transparent min-w-[150px] max-w-[180px]"
        >
          {targets.map((target) => (
            <option key={target} value={target}>
              {target === 'todos' ? 'Todos los tópicos' : target}
            </option>
          ))}
        </select>
      </div>
      <InfoTable 
        data={selectedNode}
        isVisible={isInfoVisible}
        onClose={handleNodeDeselect}
        onFilter={handleTargetChange}
        onWidthChange={setInfoTableWidth}
      />
    </div>
  );
};

export default NetworkMap;
