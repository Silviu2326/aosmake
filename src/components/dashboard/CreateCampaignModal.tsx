import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      onCreate(name.trim(), description.trim());
      setName('');
      setDescription('');
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Nueva Campaña</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la campaña"
              className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional..."
              rows={3}
              className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex items hover:text-white transition-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
