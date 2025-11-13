'use client';

import { useState } from 'react';
import { UserForAdmin } from '@/types/computed';
import { CreateCenterInput, UpdateCenterInput } from '@/lib/validations';
import { useAdminCentersStore, useAdminUsersStore } from '@/store/admin';
import { useToast } from '@/hooks/use-toast';
import {
  CenterManagementTable,
  CenterDetailsModal,
  EditCenterModal,
  CreateCenterModal,
} from '@/components/admin/centers';
import { CenterForAdmin } from '@/types';

type ModalType = 'details' | 'edit' | 'create' | null;

interface CentersTabProps {
  centers: CenterForAdmin[];
  users: UserForAdmin[];
  isLoading: boolean;
}

export function CentersTab({ centers, users, isLoading }: CentersTabProps) {
  const { toast } = useToast();
  const {
    isSubmitting,
    error,
    warnings,
    createCenter,
    updateCenter,
    deleteCenter,
    clearWarnings,
    clearError,
  } = useAdminCentersStore();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCenter, setSelectedCenter] = useState<CenterForAdmin | null>(null);

  const handleOpenModal = (type: ModalType, center?: CenterForAdmin) => {
    setActiveModal(type);
    setSelectedCenter(center || null);
    clearWarnings();
    clearError();
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedCenter(null);
    clearWarnings();
    clearError();
  };

  const handleCreateCenter = async (data: CreateCenterInput) => {
    try {
      await createCenter(data);
      toast({
        title: 'הצלחה',
        description: 'המוקד נוצר בהצלחה',
      });
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create center:', error);
    }
  };

  const handleUpdateCenter = async (data: UpdateCenterInput) => {
    console.log("🚀 ~ handleUpdateCenter ~ data:", data)
    if (!selectedCenter) return;
    try {
      await updateCenter(selectedCenter.id, data);
      toast({
        title: 'הצלחה',
        description: 'פרטי המוקד עודכנו בהצלחה',
      });
      handleCloseModal();
    } catch (error) {
      console.error('Failed to update center:', error);
    }
  };

  const handleDeleteCenter = async (id: string) => {
    try {
      await deleteCenter(id);
      toast({
        title: 'הצלחה',
        description: 'המוקד נמחק בהצלחה',
      });
    } catch (error) {
      console.error('Failed to delete center:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'לא ניתן למחוק את המוקד',
        variant: 'error',
      });
    }
  };

  return (
    <>
      <CenterManagementTable
        centers={centers}
        isLoading={isLoading}
        onViewDetails={(center) => handleOpenModal('details', center)}
        onEdit={(center) => handleOpenModal('edit', center)}
        onDelete={handleDeleteCenter}
        onCreateCenter={() => handleOpenModal('create')}
      />

      {/* Modals */}
      <CenterDetailsModal
        isOpen={activeModal === 'details'}
        onClose={handleCloseModal}
        center={selectedCenter}
      />

      <EditCenterModal
        isOpen={activeModal === 'edit'}
        onClose={handleCloseModal}
        onSubmit={handleUpdateCenter}
        center={selectedCenter}
        users={users}
        isSubmitting={isSubmitting}
        error={error}
        warnings={warnings}
      />

      <CreateCenterModal
        isOpen={activeModal === 'create'}
        onClose={handleCloseModal}
        onSubmit={handleCreateCenter}
        users={users}
        isSubmitting={isSubmitting}
        error={error}
        warnings={warnings}
      />
    </>
  );
}
