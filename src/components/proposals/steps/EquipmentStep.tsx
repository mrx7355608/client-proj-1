{/* Previous imports remain the same */}

function TemplateModal({
  isOpen,
  onClose,
  onSave,
  templates,
  onLoad,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  templates: Template[];
  onLoad: (template: Template) => void;
}) {
  const [mode, setMode] = useState<'save' | 'load'>('save');
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleDeleteTemplate = (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const updatedTemplates = templates.filter(t => t.id !== templateId);
    localStorage.setItem('equipmentTemplates', JSON.stringify(updatedTemplates));
    
    // Reset selection if deleted template was selected
    if (selectedTemplate === templateId) {
      setSelectedTemplate('');
    }
    
    // Update parent state
    onLoad({ id: '', name: '', sections: [] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('save')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                mode === 'save'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Template
              </div>
            </button>
            <button
              onClick={() => setMode('load')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                mode === 'load'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Load Template
              </div>
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'save' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter template name"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  if (templateName.trim()) {
                    onSave(templateName.trim());
                    onClose();
                  }
                }}
                disabled={!templateName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Template
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template
            </label>
            {templates.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No saved templates</p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                      selectedTemplate === template.id 
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedTemplate(template.id)}
                      className="flex-1 text-left"
                    >
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-500">
                        {template.sections.length} section{template.sections.length !== 1 ? 's' : ''}
                      </p>
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  const template = templates.find(t => t.id === selectedTemplate);
                  if (template) {
                    onLoad(template);
                    onClose();
                  }
                }}
                disabled={!selectedTemplate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Load Template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

{/* Rest of the file remains the same */}