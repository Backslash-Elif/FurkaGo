"use client";

import { ApiGetAllItems, GetAllItem } from "@/components/apiClient";
import DbImage from "@/components/dbImage";
import ItemDelete from "@/components/itemDelete";
import ItemEdit from "@/components/itemEdit";
import { title } from "@/components/primitives";
import {
  Button,
  Card,
  Drawer,
  FieldError,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<GetAllItem>();
  useEffect(() => {
    const fetchData = async () => {
      const data = await ApiGetAllItems();
      setItems(data);
    };

    fetchData();
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center p-4 gap-2">
        <h1 className={title()}>Admin</h1>
        <ItemEdit editItem={null} />
      </div>
      <div className="flex flex-wrap gap-4">
        {items
          ? items.map((item) => (
              <Card
                key={item.id}
                className="w-md sm:w-min items-stretch sm:flex-row"
              >
                <div className="relative h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px]">
                  <DbImage
                    id={item.id}
                    className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <Card.Header className="gap-1">
                    <Card.Title className="pr-8">{item.name}</Card.Title>
                  </Card.Header>
                  <Card.Footer className="mt-auto flex w-full flex-row items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <ItemEdit editItem={item.id} />
                      <ItemDelete id={item.id} itemName={item.name} />
                  </Card.Footer>
                </div>
              </Card>
            ))
          : "Loading..."}
      </div>
    </div>
  );
}
