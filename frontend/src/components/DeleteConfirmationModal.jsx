import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";

/**
 * Reusable Delete Confirmation Modal Component.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.open - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to call when the modal is requested to close (e.g., by clicking outside or cancel button).
 * @param {function} props.onConfirm - Function to call when the delete action is confirmed.
 * @param {string} props.title - The title text for the modal dialog.
 * @param {string} props.message - The main message text displayed in the dialog content.
 * @param {string} [props.confirmText="Delete"] - Optional text for the confirm button.
 * @param {string} [props.cancelText="Cancel"] - Optional text for the cancel button.
 */
function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
}) {
  console.log("running delete confirmation modal");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          bgcolor: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
        },
      }}
    >
      {title && (
        <DialogTitle
          id="delete-dialog-title"
          sx={{
            color: (theme) => theme.palette.error.main,
            fontWeight: 'bold',
            bgcolor: 'transparent',
          }}
        >
          {title}
        </DialogTitle>
      )}
      <DialogContent
        sx={{
          bgcolor: 'transparent',
        }}
      >
        <DialogContentText
          id="delete-dialog-description"
          sx={{
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          {description || message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          padding: '16px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          bgcolor: 'transparent',
        }}
      >
        <Button
          onClick={onClose}
          color="primary"
          variant="outlined"
          sx={{
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            bgcolor: 'transparent',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          autoFocus
          sx={{
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            bgcolor: (theme) => theme.palette.error.main,
            color: (theme) => theme.palette.getContrastText(theme.palette.error.main),
            '&:hover': {
              backgroundColor: (theme) => theme.palette.error.dark,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteConfirmationModal;
