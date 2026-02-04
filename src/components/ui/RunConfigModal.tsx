import React, { useState } from 'react';
import { Modal } from './Modal';
import { Play } from 'lucide-react';

interface RunConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (workers: number) => void;
}

export const RunConfigModal: React.FC<RunConfigModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [workers, setWorkers] = useState<number>(1);

    const handleConfirm = () => {
        onConfirm(workers);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Execution Configuration"
            description="Configure execution parameters before running the workflow."
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md hover:bg-white/10 text-gray-300 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors text-sm font-medium"
                    >
                        <Play size={16} />
                        Run Now
                    </button>
                </>
            }
        >
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                        Number of Workers
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={workers}
                        onChange={(e) => setWorkers(parseInt(e.target.value) || 1)}
                        className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 text-white"
                    />
                    <p className="text-xs text-gray-500">
                        Define how many parallel executions (workers) to use.
                    </p>
                </div>
            </div>
        </Modal>
    );
};
