import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../lib/supabase';
import RevenueShareModal from './RevenueShareModal';

interface RevenueShare {
  id: string;
  partner_id: string;
  percentage: number | null;
  flat_rate: number | null;
  start_date: string;
  end_date: string | null;
  priority_order: number;
  partner: {
    name: string;
    type: string;
  };
}

interface RevenueShareListProps {
  clientId: string;
  revenueShares: RevenueShare[];
  netProfit: number;
  onUpdate: () => void;
}

function SortableRevenueShare({ share, onEdit, onDelete, netProfit, previousDeductions }: { 
  share: RevenueShare; 
  onEdit: (share: RevenueShare) => void;
  onDelete: (id: string) => void;
  netProfit: number;
  previousDeductions: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: share.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  // Calculate amount based on remaining profit after previous deductions
  const remainingProfit = netProfit - previousDeductions;
  const amount = share.flat_rate !== null 
    ? share.flat_rate 
    : share.percentage !== null 
      ? (remainingProfit * share.percentage) / 100 
      : 0;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <button 
          {...attributes} 
          {...listeners}
          className="touch-none text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        
        <div>
          <h3 className="text-sm font-medium text-gray-800">{share.partner.name}</h3>
          <div className="mt-1 space-y-1 text-xs text-gray-500">
            <p>
              {share.percentage !== null
                ? `${share.percentage}% of remaining profit ($${remainingProfit.toLocaleString()})`
                : `$${share.flat_rate?.toLocaleString()} flat rate`}
              {' • '}
              Monthly Payout: <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">${amount.toLocaleString()}</span>
            </p>
            <p>
              From: {format(new Date(share.start_date), 'MMM d, yyyy')}
              {share.end_date && ` to ${format(new Date(share.end_date), 'MMM d, yyyy')}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(share)}
          className="text-blue-500 hover:text-blue-700"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(share.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function RevenueShareList({
  clientId,
  revenueShares,
  netProfit,
  onUpdate,
}: RevenueShareListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<RevenueShare | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate total monthly payouts with cascading percentages
  const calculateTotalPayouts = () => {
    let remainingProfit = netProfit;
    let totalPayouts = 0;

    for (const share of revenueShares) {
      if (share.flat_rate !== null) {
        totalPayouts += share.flat_rate;
      } else if (share.percentage !== null) {
        const amount = (remainingProfit * share.percentage) / 100;
        totalPayouts += amount;
        remainingProfit -= amount;
      }
    }

    return totalPayouts;
  };

  // Calculate previous deductions for each share
  const getPreviousDeductions = (index: number) => {
    let deductions = 0;
    
    for (let i = 0; i < index; i++) {
      const share = revenueShares[i];
      if (share.flat_rate !== null) {
        deductions += share.flat_rate;
      } else if (share.percentage !== null) {
        const remainingProfit = netProfit - deductions;
        deductions += (remainingProfit * share.percentage) / 100;
      }
    }

    return deductions;
  };

  const handleEdit = async (share: RevenueShare) => {
    setSelectedShare(share);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this revenue share?')) return;

    try {
      const { error } = await supabase
        .from('partner_revenue_shares')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting revenue share:', error);
      alert('Error deleting revenue share. Please try again.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = revenueShares.findIndex(share => share.id === active.id);
    const newIndex = revenueShares.findIndex(share => share.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    try {
      // Get all shares in the new order
      const reorderedShares = [...revenueShares];
      const [movedShare] = reorderedShares.splice(oldIndex, 1);
      reorderedShares.splice(newIndex, 0, movedShare);

      // Update priority orders
      const updates = reorderedShares.map((share, index) => ({
        id: share.id,
        priority_order: index
      }));

      // Update only the priority_order field
      for (const update of updates) {
        const { error } = await supabase
          .from('partner_revenue_shares')
          .update({ priority_order: update.priority_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      onUpdate();
    } catch (error) {
      console.error('Error updating priority orders:', error);
      alert('Error updating priority order. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Revenue Shares</h2>
          <p className="text-sm text-gray-500">
            Total Monthly Payouts: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">${calculateTotalPayouts().toLocaleString()}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedShare(undefined);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center text-sm hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Revenue Share
        </button>
      </div>

      <div className="space-y-3">
        {revenueShares.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No revenue shares configured</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={revenueShares.map(share => share.id)}
              strategy={verticalListSortingStrategy}
            >
              {revenueShares.map((share, index) => (
                <SortableRevenueShare
                  key={share.id}
                  share={share}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  netProfit={netProfit}
                  previousDeductions={getPreviousDeductions(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <RevenueShareModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedShare(undefined);
        }}
        onSaved={onUpdate}
        clientId={clientId}
        revenueShare={selectedShare}
      />
    </div>
  );
}