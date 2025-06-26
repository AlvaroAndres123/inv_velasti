"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = "¿Estás seguro?",
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="text-gray-700 text-center mb-4"
        >
          {message}
        </motion.div>
        <DialogFooter className="flex gap-2 justify-center">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 