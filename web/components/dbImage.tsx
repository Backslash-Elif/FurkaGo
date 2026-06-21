"use client";

import { useEffect, useState } from "react";
import { ApiGetItem, Item } from "./apiClient";
import { Spinner } from "@heroui/react";

type DbImageParams = {
  id: string;
};

type DbImageProps = DbImageParams & React.ImgHTMLAttributes<HTMLImageElement>;

export default function DbImage({ id, ...params }: DbImageProps) {
  const [item, setItem] = useState<Item>();
  useEffect(() => {
    const fetchData = async () => {
      const data = await ApiGetItem(id);
      setItem(data);
    };

    fetchData();
  }, []);
  return (
    <>
      {item ? (
        <img src={item?.photo} alt="image" {...params} />
      ) : (
        <div className="flex items-center gap-4 p-4">
          <Spinner />
        </div>
      )}
    </>
  );
}
