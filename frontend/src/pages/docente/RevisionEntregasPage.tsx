import React, { useState, useEffect } from 'react';
import { FileText, Download, AlertCircle, X, Inbox, ChevronRight } from 'lucide-react';
import { getMisProyectosAsignados, getDocumentosProyecto, descargarDocumento, type ProyectoConUsuario, type Documento } from '../../api';

export const RevisionEntregasPage: React.FC = () => {
  const [proyectos, setProyectos]               = useState<ProyectoConUsuario[]>([]);
  const [seleccionado, setSeleccionado]         = useState<ProyectoConUsuario | null>(null);
  const [documentos, setDocumentos]             = useState<Documento[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingDocs, setLoadingDocs]           = useState(false);
  const [error, setError]                       = useState('');

  useEffect(() => {
    getMisProyectosAsignados()
      .then(setProyectos)
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar proyectos.'))
      .finally(() => setLoadingProyectos(false));
  }, []);

  const seleccionarProyecto = async (proyecto: ProyectoConUsuario) => {
    setSeleccionado(proyecto);
    setDocumentos([]);
    setError('');
    setLoadingDocs(true);
    try {
      const data = await getDocumentosProyecto(proyecto.id_proyecto);
      setDocumentos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar documentos.');
    } finally {
      setLoadingDocs(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-[#0f766e]">Revisión de Entregas</h1>
        <p className="text-sm text-gray-500 mt-1">Revisa los documentos subidos por los emprendedores.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex gap-6 items-start">

        {/* Lista de proyectos */}
        <div className="w-72 shrink-0 bg-white border border-gray-100 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Proyectos asignados</p>
          </div>

          {loadingProyectos ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : proyectos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10 px-4">Sin proyectos asignados.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {proyectos.map(p => (
                <li key={p.id_proyecto}>
                  <button
                    onClick={() => seleccionarProyecto(p)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-colors cursor-pointer
                      ${seleccionado?.id_proyecto === p.id_proyecto ? 'bg-teal-50 text-[#0f766e]' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.nombre_proyecto}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.usuario?.nombre ?? '—'}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${seleccionado?.id_proyecto === p.id_proyecto ? 'text-[#0f766e]' : 'text-gray-300'}`} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Panel de documentos */}
        <div className="flex-1 min-w-0">
          {!seleccionado ? (
            <div className="bg-white border border-gray-100 rounded-lg py-20 flex flex-col items-center justify-center text-center">
              <Inbox className="w-8 h-8 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">Selecciona un proyecto para ver sus documentos.</p>
            </div>
          ) : loadingDocs ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-lg px-5 py-4">
                <h2 className="text-base font-medium text-gray-800">{seleccionado.nombre_proyecto}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Emprendedor: <span className="font-medium text-gray-700">{seleccionado.usuario?.nombre ?? '—'}</span>
                </p>
              </div>

              {documentos.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-lg py-16 flex flex-col items-center justify-center text-center">
                  <FileText className="w-7 h-7 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400 font-medium">El emprendedor aún no ha subido documentos.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documentos.map((d, i) => (
                    <div key={d.id_documento} className="bg-white border border-gray-100 rounded-lg p-5 flex items-center gap-4">
                      <FileText className="w-5 h-5 text-[#0f766e] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{d.nombre}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Documento #{i + 1} · {new Date(d.fecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={() => descargarDocumento(d.id_documento, d.nombre)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0f766e] text-white text-sm font-normal rounded-lg hover:bg-[#115e59] transition-colors shrink-0 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
