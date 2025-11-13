'use client';

import { useState } from 'react';
import { UserForAdmin, CenterForAdmin } from '@/types/computed';
import { UpdateUserByAdminInput, AssignRoleInput, CreateUserInput } from '@/lib/validations';
import { useAdminUsersStore } from '@/store/admin';
import { useToast } from '@/hooks/use-toast';
import {
  UserManagementTable,
  UserDetailsModal,
  EditUserModal,
  AssignRoleModal,
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
    assignRole,
    clearWarnings,
  } = useAdminUsersStore();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<UserForAdmin | null>(null);

  const handleOpenModal = (type: ModalType, user?: UserForAdmin) => {
    setActiveModal(type);
    setSelectedUser(user || null);
    clearWarnings();
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
    clearWarnings();
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

  const handleAssignRole = async (data: AssignRoleInput) => {
    if (!selectedUser) return;
    try {
      await assignRole(selectedUser.id, data);
      toast({
        title: 'הצלחה',
        description: 'התפקידים עודכנו בהצלחה',
      });
      handleCloseModal();
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  return (
    <>
      <UserManagementTable
        users={users}
        isLoading={isLoading}
        onViewDetails={(user) => handleOpenModal('details', user)}
        onEdit={(user) => handleOpenModal('edit', user)}
        onAssignRole={(user) => handleOpenModal('role', user)}
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

      <AssignRoleModal
        isOpen={activeModal === 'role'}
        onClose={handleCloseModal}
        onSubmit={handleAssignRole}
        user={selectedUser}
        centers={centers}
        isSubmitting={isSubmitting}
        error={error}
        warnings={warnings}
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
