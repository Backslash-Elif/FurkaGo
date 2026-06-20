"use client";

import { useEffect, useState } from "react";
import { ApiGetItem, Item } from "./apiClient";

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
  return <>{item ? <img src={item?.photo} alt="image" {...params} /> : "[img load]"}</>;
}
