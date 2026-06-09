import React, { useState } from 'react';
import { BookOpen, AlertCircle, Send, CheckCircle } from 'lucide-react';
import { createProject } from '../api';

interface FormData {
  nombre: string;
  descripcion: string;
  sector_tecnologico: string;
  problem_statement: string;
  propuesta_valor: string;
}

interface FormErrors {
  nombre?: string;
  descripcion?: string;
  sector_tecnologico?: string;
  problem_statement?: string;
  propuesta_valor?: string;
}

interface ProjectRegistrationFormProps {
  onSuccess?: () => void;
}

export const ProjectRegistrationForm: React.FC<ProjectRegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    sector_tecnologico: '',
    problem_statement: '',
    propuesta_valor: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Requerido';
    if (!formData.descripcion.trim() || formData.descripcion.length < 20) {
      newErrors.descripcion = 'Mínimo 20 caracteres';
    }
    if (!formData.sector_tecnologico) newErrors.sector_tecnologico = 'Requerido';
    if (!formData.problem_statement.trim()) newErrors.problem_statement = 'Requerido';
    if (!formData.propuesta_valor.trim()) newErrors.propuesta_valor = 'Requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await createProject({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        sector_tecnologico: formData.sector_tecnologico,
        propuesta_valor: formData.propuesta_valor,
      });
      setFormData({ nombre: '', descripcion: '', sector_tecnologico: '', problem_statement: '', propuesta_valor: '' });
      setErrors({});
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onSuccess?.(); }, 2000);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Error al registrar proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="w-full bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-[#1A365D] px-8 py-7 border-b-[5px] border-[#3182CE]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl text-white border border-white/20">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-medium text-white tracking-tight">Nuevo Proyecto</h2>
            <p className="text-blue-200/90 text-sm mt-1 font-medium">Registra tu idea para evaluación.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">

        <div className="grid grid-cols-1 gap-6">
          {/* Nombre y Sector */}
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-medium text-[#1A365D] flex justify-between uppercase tracking-wide">
              Nombre del Proyecto
              {errors.nombre && <span className="text-[#3182CE] font-normal text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.nombre}</span>}
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`w-full px-5 py-3.5 rounded-xl border bg-gray-50 font-medium transition-all duration-300 outline-none
                ${errors.nombre
                  ? 'border-[#3182CE] focus:ring-4 focus:ring-red-50 focus:border-[#3182CE] bg-white'
                  : 'border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#1A365D] hover:border-[#1A365D] bg-white'
                }`}
              placeholder="Ej. InnoTech Soluciones"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sector_tecnologico" className="text-sm font-medium text-[#1A365D] flex justify-between uppercase tracking-wide">
              Sector Técnico
              {errors.sector_tecnologico && <span className="text-[#3182CE] font-normal text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.sector_tecnologico}</span>}
            </label>
            <div className="relative">
              <select
                id="sector_tecnologico"
                name="sector_tecnologico"
                value={formData.sector_tecnologico}
                onChange={handleInputChange}
                className={`w-full px-5 py-3.5 appearance-none rounded-xl border bg-gray-50 font-medium transition-all duration-300 outline-none
                  ${errors.sector_tecnologico
                    ? 'border-[#3182CE] focus:ring-4 focus:ring-red-50 focus:border-[#3182CE] bg-white'
                    : 'border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#1A365D] hover:border-[#1A365D] bg-white'
                  }`}
              >
                <option value="" disabled>Selecciona un área...</option>
                <option value="EdTech">Educación / Investigación</option>
                <option value="HealthTech">Salud / Biotecnología</option>
                <option value="FinTech">Financiero</option>
                <option value="AgriTech">Agrícola / Ambiental</option>
                <option value="AI_SaaS">Plataformas Web / IA</option>
                <option value="Other">Otros Modelos</option>
              </select>
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[#1A365D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Problema */}
          <div className="space-y-2">
            <label htmlFor="problem_statement" className="text-sm font-medium text-[#1A365D] flex justify-between uppercase tracking-wide">
              Problema que Resuelve
              {errors.problem_statement && <span className="text-[#3182CE] font-normal text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.problem_statement}</span>}
            </label>
            <input
              type="text"
              id="problem_statement"
              name="problem_statement"
              value={formData.problem_statement}
              onChange={handleInputChange}
              className={`w-full px-5 py-3.5 rounded-xl border bg-gray-50 font-medium transition-all duration-300 outline-none
                ${errors.problem_statement
                  ? 'border-[#3182CE] focus:ring-4 focus:ring-red-50 focus:border-[#3182CE] bg-white'
                  : 'border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#1A365D] hover:border-[#1A365D] bg-white'
                }`}
              placeholder="¿Qué problema del mundo real atacas?"
            />
          </div>

          {/* Propuesta */}
          <div className="space-y-2">
            <label htmlFor="propuesta_valor" className="text-sm font-medium text-[#1A365D] flex justify-between uppercase tracking-wide">
              Propuesta de Valor
              {errors.propuesta_valor && <span className="text-[#3182CE] font-normal text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.propuesta_valor}</span>}
            </label>
            <input
              type="text"
              id="propuesta_valor"
              name="propuesta_valor"
              value={formData.propuesta_valor}
              onChange={handleInputChange}
              className={`w-full px-5 py-3.5 rounded-xl border bg-gray-50 font-medium transition-all duration-300 outline-none
                ${errors.propuesta_valor
                  ? 'border-[#3182CE] focus:ring-4 focus:ring-red-50 focus:border-[#3182CE] bg-white'
                  : 'border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#1A365D] hover:border-[#1A365D] bg-white'
                }`}
              placeholder="¿Qué hace única a tu innovación?"
            />
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <label htmlFor="descripcion" className="text-sm font-medium text-[#1A365D] flex justify-between uppercase tracking-wide">
              Descripción General
              {errors.descripcion && <span className="text-[#3182CE] font-normal text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.descripcion}</span>}
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={handleInputChange}
              className={`w-full px-5 py-3.5 rounded-xl border bg-gray-50 font-medium transition-all duration-300 outline-none resize-y
                ${errors.descripcion
                  ? 'border-[#3182CE] focus:ring-4 focus:ring-red-50 focus:border-[#3182CE] bg-white'
                  : 'border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#1A365D] hover:border-[#1A365D] bg-white'
                }`}
              placeholder="Detalla cómo tu idea impactará en la comunidad o mercado objetivo."
            />
          </div>
        </div>

        {apiError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[#3182CE] text-sm font-normal flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {apiError}
          </div>
        )}

        {success && (
          <div className="px-4 py-3 bg-[#EBF8FF] border border-blue-200 rounded-xl text-[#1A365D] text-sm font-normal flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" /> ¡Proyecto registrado exitosamente!
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full py-4 px-6 bg-[#1A365D] hover:bg-[#0F2442] hover:-translate-y-1 active:scale-[0.98] transition-all cursor-pointer text-white font-medium uppercase tracking-wide rounded-xl shadow-lg flex justify-center items-center gap-3 mt-4 disabled:opacity-75 disabled:active:scale-100 disabled:translate-y-0"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </div>
          ) : (
            <>
              Enviar Proyecto Institucional
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
