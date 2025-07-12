
import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

interface SkillFormProps {
  onSubmit: (skill: {
    name: string;
    type: 'offered' | 'wanted';
    level: 'Beginner' | 'Intermediate' | 'Pro';
    description?: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    type: 'offered' | 'wanted';
    level: 'Beginner' | 'Intermediate' | 'Pro';
    description?: string;
  };
}

const SkillForm: React.FC<SkillFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'offered' as 'offered' | 'wanted',
    level: initialData?.level || 'Beginner' as 'Beginner' | 'Intermediate' | 'Pro',
    description: initialData?.description || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Skill name is required';
    }
    
    if (formData.name.length < 3) {
      newErrors.name = 'Skill name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Skill' : 'Add New Skill'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="skillName" className="block text-sm font-medium text-gray-700 mb-2">
            Skill Name *
          </label>
          <input
            type="text"
            id="skillName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Photoshop, Excel, Guitar, Cooking"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skill Type *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'offered' })}
              className={`p-4 border rounded-lg text-center transition-colors ${
                formData.type === 'offered'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-lg mb-1">🎁</div>
              <div className="font-medium">I can offer</div>
              <div className="text-sm text-gray-600">Skills I can teach</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'wanted' })}
              className={`p-4 border rounded-lg text-center transition-colors ${
                formData.type === 'wanted'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-lg mb-1">🎯</div>
              <div className="font-medium">I want to learn</div>
              <div className="text-sm text-gray-600">Skills I need help with</div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Level *
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['Beginner', 'Intermediate', 'Pro'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, level })}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  formData.level === level
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-lg mb-1">
                  {level === 'Beginner' && '🟢'}
                  {level === 'Intermediate' && '🟡'}
                  {level === 'Pro' && '🔴'}
                </div>
                <div className="font-medium">{level}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell others more about this skill..."
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Save size={20} />
            <span>{initialData ? 'Update Skill' : 'Add Skill'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SkillForm;
