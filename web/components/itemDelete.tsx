"use client";

import { AlertDialog, Button, toast } from "@heroui/react";
import { useState } from "react";
import { HiTrash } from "react-icons/hi2";
import { ApiDeleteItem } from "./apiClient";

type itemDeleteProps = {
  id: string;
  itemName: string;
};

export default function ItemDelete({ id, itemName }: itemDeleteProps) {
  const [isOpen, setIsOpen] = useState(false);

  const onConfirm = async () => {
    await ApiDeleteItem(id);
    toast.info(`Deleted ${itemName} successfully.`);
    window.location.reload();
  };
  return (
    <>
      <Button variant="danger-soft" onPress={() => setIsOpen(true)}>
        <HiTrash /> &nbsp;Delete
      </Button>
      <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon />
              <AlertDialog.Heading>
                Do you really want to delete "{itemName}"?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-danger text-xl">Be careful!</p>
              <p>
                Once you delete "{itemName}", it'll be gone permanently.
                <br />
                (There is no trash; the item gets deleted right away.)
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button variant="danger" onPress={onConfirm}>
                Delete
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  );
}
