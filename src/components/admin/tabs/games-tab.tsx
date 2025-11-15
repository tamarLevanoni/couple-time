'use client';

import { useState } from 'react';
import { useAdminGamesStore } from '@/store/admin';
import { useToast } from '@/hooks/use-toast';
import {
  GameManagementTable,
  GameDetailsModal,
  EditGameModal,
  CreateGameModal,
} from '@/components/admin/games';
import { GameWithInstances } from '@/types/models';
import { CreateGameInput, UpdateGameInput } from '@/lib/validations';
import { CldUploadButton } from 'next-cloudinary';

type ModalType = 'details' | 'edit' | 'create' | null;

interface GamesTabProps {
  games: GameWithInstances[];
  isLoading: boolean;
}

export function GamesTab({ games, isLoading }: GamesTabProps) {
  const { toast } = useToast();
  const {
    isSubmitting,
    error,
    warnings,
    createGame,
    updateGame,
    deleteGame,
    clearWarnings,
    clearError,
  } = useAdminGamesStore();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedGame, setSelectedGame] = useState<GameWithInstances | null>(null);

  const handleOpenModal = (type: ModalType, game?: GameWithInstances) => {
    setActiveModal(type);
    setSelectedGame(game || null);
    clearWarnings();
    clearError();
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedGame(null);
    clearWarnings();
    clearError();
  };

  const handleCreateGame = async (data: CreateGameInput) => {
    try {
      await createGame(data);
      toast({
        title: 'הצלחה',
        description: 'המשחק נוצר בהצלחה',
      });
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  const handleUpdateGame = async (data: UpdateGameInput) => {
    if (!selectedGame) return;
    try {
      await updateGame(selectedGame.id, data);
      toast({
        title: 'הצלחה',
        description: 'פרטי המשחק עודכנו בהצלחה',
      });
      handleCloseModal();
    } catch (error) {
      console.error('Failed to update game:', error);
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      await deleteGame(id);
      toast({
        title: 'הצלחה',
        description: 'המשחק נמחק בהצלחה',
      });
    } catch (error) {
      console.error('Failed to delete game:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'לא ניתן למחוק את המשחק',
        variant: 'error',
      });
    }
  };

  return (
    <>
              <CldUploadButton uploadPreset="<Upload Preset>" />

      <GameManagementTable
        games={games}
        isLoading={isLoading}
        onViewDetails={(game) => handleOpenModal('details', game)}
        onEdit={(game) => handleOpenModal('edit', game)}
        onDelete={handleDeleteGame}
        onCreateGame={() => handleOpenModal('create')}
      />

      {/* Modals */}
      <GameDetailsModal
        isOpen={activeModal === 'details'}
        onClose={handleCloseModal}
        game={selectedGame}
      />

      <EditGameModal
        isOpen={activeModal === 'edit'}
        onClose={handleCloseModal}
        onSubmit={handleUpdateGame}
        game={selectedGame}
        isSubmitting={isSubmitting}
        error={error}
        warnings={warnings}
      />

      <CreateGameModal
        isOpen={activeModal === 'create'}
        onClose={handleCloseModal}
        onSubmit={handleCreateGame}
        isSubmitting={isSubmitting}
        error={error}
        warnings={warnings}
      />
    </>
  );
}
