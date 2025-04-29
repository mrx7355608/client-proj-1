import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import {
  Search,
  Plus,
  Minus,
  ImageOff,
  Trash2,
  GripVertical,
  Save,
  FolderOpen,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Section {
  id: string;
  name: string;
  equipment: {
    id: string;
    name: string;
    quantity: number;
    category: string;
    image_url: string | null;
  }[];
}

interface EquipmentStepProps {
  sections: Section[];
  onBack: () => void;
  onSubmit: (sections: Section[]) => void;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string;
  vendor?: {
    name: string;
  };
  image_url: string | null;
}

interface Template {
  id: string;
  name: string;
  sections: Section[];
}

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
  const [mode, setMode] = useState<"save" | "load">("save");
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("save")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                mode === "save"
                  ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Template
              </div>
            </button>
            <button
              onClick={() => setMode("load")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                mode === "load"
                  ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
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

        {mode === "save" ? (
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
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  const template = templates.find(
                    (t) => t.id === selectedTemplate,
                  );
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

function SectionSearch({
  onSelect,
  sectionId,
}: {
  onSelect: (item: InventoryItem) => void;
  sectionId: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length >= 2) {
      searchItems();
    } else {
      setResults([]);
    }
  }, [query]);

  const searchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .select(
          `
          id,
          name,
          description,
          sku,
          category,
          vendor:inventory_vendors (
            name
          ),
          image_url
        `,
        )
        .ilike("name", `%${query}%`)
        .limit(5);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Error searching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (item: InventoryItem) => {
    onSelect(item);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search equipment..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {query.length >= 2 && (
        <div className="mt-2 space-y-2">
          {isLoading ? (
            <div className="text-center py-2 text-sm text-gray-500">
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md text-left"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <ImageOff className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </div>
                  {item.sku && (
                    <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                  )}
                </div>
                <div className="text-xs font-medium text-gray-500">
                  {item.category}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-2 text-sm text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SortableSection({
  section,
  onUpdate,
  onDelete,
  onAddEquipment,
  onRemoveEquipment,
  onUpdateQuantity,
  equipment,
}: {
  section: Section;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAddEquipment: (sectionId: string, item: InventoryItem) => void;
  onRemoveEquipment: (sectionId: string, itemId: string) => void;
  onUpdateQuantity: (
    sectionId: string,
    itemId: string,
    quantity: number,
  ) => void;
  equipment: Record<string, InventoryItem>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 rounded-lg p-4 mb-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          className="cursor-grab text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={section.name}
          onChange={(e) => onUpdate(section.id, e.target.value)}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Section Name"
        />
        <button
          onClick={() => onDelete(section.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <SectionSearch
        sectionId={section.id}
        onSelect={(item) => onAddEquipment(section.id, item)}
      />

      <div className="space-y-2">
        {section.equipment.map((item) => {
          const itemDetails = equipment[item.id];
          console.log({ equipment });
          if (!itemDetails) return null;

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 bg-white rounded-lg"
            >
              {itemDetails.image_url ? (
                <img
                  src={itemDetails.image_url}
                  alt={itemDetails.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageOff className="w-5 h-5 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">
                  {itemDetails.name}
                </h3>
                {itemDetails.sku && (
                  <p className="text-xs text-gray-500">
                    SKU: {itemDetails.sku}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {itemDetails.category}
                  </span>
                  {itemDetails.vendor && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {itemDetails.vendor.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQuantity(
                      section.id,
                      item.id,
                      Math.max(0, item.quantity - 1),
                    )
                  }
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQuantity(section.id, item.id, item.quantity + 1)
                  }
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveEquipment(section.id, item.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EquipmentStep({
  sections: initialSections,
  onBack,
  onSubmit,
}: EquipmentStepProps) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [equipmentDetails, setEquipmentDetails] = useState<
    Record<string, InventoryItem>
  >({});
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const loadEquipmentDetails = async () => {
      const itemIds = new Set<string>();
      initialSections.forEach((section) => {
        section.equipment.forEach((item) => {
          itemIds.add(item.id);
        });
      });

      if (itemIds.size === 0) return;

      try {
        const { data, error } = await supabase
          .from("inventory_items")
          .select(
            `
            id,
            name,
            description,
            sku,
            category,
            vendor:inventory_vendors (
              name
            ),
            image_url
          `,
          )
          .in("id", Array.from(itemIds));

        if (error) throw error;

        const details: Record<string, InventoryItem> = {};
        data?.forEach((item) => {
          details[item.id] = item;
        });
        setEquipmentDetails(details);
      } catch (error) {
        console.error("Error loading equipment details:", error);
      }
    };

    loadEquipmentDetails();
  }, [initialSections]);

  useEffect(() => {
    const loadTemplates = () => {
      const savedTemplates = localStorage.getItem("equipmentTemplates");
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }
    };

    loadTemplates();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addNewSection = () => {
    setSections([
      ...sections,
      {
        id: crypto.randomUUID(),
        name: "New Section",
        equipment: [],
      },
    ]);
  };

  const updateSectionName = (sectionId: string, name: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, name } : section,
      ),
    );
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter((section) => section.id !== sectionId));
  };

  const addEquipmentToSection = (sectionId: string, item: InventoryItem) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const existingItem = section.equipment.find((e) => e.id === item.id);
          if (existingItem) {
            return {
              ...section,
              equipment: section.equipment.map((e) =>
                e.id === item.id ? { ...e, quantity: e.quantity + 1 } : e,
              ),
            };
          }
          return {
            ...section,
            equipment: [
              ...section.equipment,
              {
                id: item.id,
                quantity: 1,
                name: item.name,
                category: item.category,
                image_url: item.image_url,
              },
            ],
          };
        }
        return section;
      }),
    );

    setEquipmentDetails((prev) => ({
      ...prev,
      [item.id]: item,
    }));
  };

  const removeEquipmentFromSection = (sectionId: string, itemId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              equipment: section.equipment.filter((e) => e.id !== itemId),
            }
          : section,
      ),
    );
  };

  const updateEquipmentQuantity = (
    sectionId: string,
    itemId: string,
    quantity: number,
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              equipment:
                quantity === 0
                  ? section.equipment.filter((e) => e.id !== itemId)
                  : section.equipment.map((e) =>
                      e.id === itemId ? { ...e, quantity } : e,
                    ),
            }
          : section,
      ),
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((sections) => {
        const oldIndex = sections.findIndex(
          (section) => section.id === active.id,
        );
        const newIndex = sections.findIndex(
          (section) => section.id === over.id,
        );

        const newSections = [...sections];
        const [movedSection] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, movedSection);

        return newSections;
      });
    }
  };

  const saveTemplate = (name: string) => {
    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name,
      sections,
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem(
      "equipmentTemplates",
      JSON.stringify(updatedTemplates),
    );
  };

  const loadTemplate = async (template: Template) => {
    try {
      const itemIds = new Set<string>();
      template.sections.forEach((section) => {
        section.equipment.forEach((item) => {
          itemIds.add(item.id);
        });
      });

      if (itemIds.size === 0) {
        setSections(template.sections);
        return;
      }

      const { data, error } = await supabase
        .from("inventory_items")
        .select(
          `
          id,
          name,
          description,
          sku,
          category,
          vendor:inventory_vendors (
            name
          ),
          image_url
        `,
        )
        .in("id", Array.from(itemIds));

      if (error) throw error;

      const details: Record<string, InventoryItem> = {};
      data?.forEach((item) => {
        details[item.id] = item;
      });
      setEquipmentDetails((prev) => ({
        ...prev,
        ...details,
      }));

      setSections(template.sections);
    } catch (error) {
      console.error("Error loading template:", error);
      alert("Error loading template. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Select Equipment
          </h2>
          <p className="mt-2 text-gray-600">
            Add equipment to each section of your proposal
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-3 py-1.5 bg-white text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Templates
          </button>
          <button
            type="button"
            onClick={addNewSection}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Section
          </button>
        </div>
      </div>

      <div className="mb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onUpdate={updateSectionName}
                onDelete={deleteSection}
                onAddEquipment={addEquipmentToSection}
                onRemoveEquipment={removeEquipmentFromSection}
                onUpdateQuantity={updateEquipmentQuantity}
                equipment={equipmentDetails}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onSubmit(sections)}
          className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Next
        </button>
      </div>

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={saveTemplate}
        templates={templates}
        onLoad={loadTemplate}
      />
    </div>
  );
}

