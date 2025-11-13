'use client';

import { useState } from 'react';
import { UserForAdmin, CenterForAdmin } from '@/types/computed';
import { UpdateUserByAdminInput, CreateUserInput } from '@/lib/validations';
import { useAdminUsersStore, useAdminCentersStore } from '@/store/admin';
import { useToast } from '@/hooks/use-toast';
import {
  UserManagementTable,
  UserDetailsModal,
  EditUserModal,
  CreateUserModal,
} from '@/components/admin';

type ModalType = 'details' | 'edit' | 'role' | 'create' | null;

interface UsersTabProps {
  users: UserForAdmin[];
  centers: CenterForAdmin[];
  isLoading: boolean;
}

export function UsersTab({ users, centers, isLoading }: UsersTabProps) {
  const { toast } = useToast();
  const {
    isSubmitting,
    error,
    warnings,
    createUser,
    updateUser,
    clearWarnings,
    clearError,
  } = useAdminUsersStore();

  const { loadCenters } = useAdminCentersStore();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<UserForAdmin | null>(null);

  const handleOpenModal = (type: ModalType, user?: UserForAdmin) => {
    setActiveModal(type);
    setSelectedUser(user || null);
    clearWarnings();
    clearError();
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
    clearWarnings();
    clearError();
  };

  const handleCreateUser = async (data: CreateUserInput) => {
    try {
      await createUser(data);
      toast({
        title: 'הצלחה',
        description: 'המשתמש נוצר בהצלחה',
      });
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (data: UpdateUserByAdminInput) => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, data);
      toast({
        title: 'הצלחה',
        description: 'פרטי המשתמש עודכנו בהצלחה',
      });
      handleCloseModal();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <>
      <UserManagementTable
        users={users}
        isLoading={isLoading}
        onViewDetails={(user) => handleOpenModal('details', user)}
        onEdit={(user) => handleOpenModal('edit', user)}
        onCreateUser={() => handleOpenModal('create')}
      />

      {/* Modals */}
      <UserDetailsModal
        isOpen={activeModal === 'details'}
        onClose={handleCloseModal}
        user={selectedUser}
      />

      <EditUserModal
        isOpen={activeModal === 'edit'}
        onClose={handleCloseModal}
        onSubmit={handleUpdateUser}
        user={selectedUser}
        isSubmitting={isSubmitting}
        error={error}
      />

      <CreateUserModal
        isOpen={activeModal === 'create'}
        onClose={handleCloseModal}
        onSubmit={handleCreateUser}
        centers={centers}
        isSubmitting={isSubmitting}
        error={error}
        warnings={warnings}
      />
    </>
  );
}
