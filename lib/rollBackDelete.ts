export const rollbackDelete = async (fileId: string) => {
  try {
    await fetch(`/api/auth/imageKit-del/${fileId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Rollback delete failed:', err);
  }
};
