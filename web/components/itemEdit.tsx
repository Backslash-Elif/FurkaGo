import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Popover,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { useEffect, useState } from "react";
import {
  ApiCreateItem,
  ApiGetItem,
  ApiUpdateItem,
  CreateItem,
  encodeFileToBase64,
  Item,
  UpdateItem,
} from "./apiClient";
import { FaPen, FaPlus } from "react-icons/fa6";
import { HiInformationCircle } from "react-icons/hi2";

type ItemEditProps = {
  editItem: string | null;
};

function parseTech(input: string): Record<string, string> {
  if (typeof input !== "string") return {};
  const s = input.trim();
  if (s === "") return {};

  const obj: Record<string, string> = {};
  const lines = s.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "") continue;

    const idx = line.indexOf(":");
    if (idx === -1) return {};

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) return {};

    obj[key] = value;
  }

  return obj;
}

function constructTech(obj: object): string {
  if (!obj || typeof obj !== "object") return "";
  const keys = Object.keys(obj);
  if (keys.length === 0) return "";

  return (
    keys
      .map((k) => `${k}: ${String((obj as Record<string, unknown>)[k])}`)
      .join("\n") + "\n"
  );
}

function parseQuiz(input: string) {
  if (typeof input !== "string") return null;
  if (input.trim() === "") return [];

  const lines = input.split("\n").map((l) => l.trimEnd());

  const entries = [];
  let i = 0;

  const fail = () => null;

  while (i < lines.length) {
    // skip empty lines between entries
    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) break;

    if (lines[i].trim() === "") continue;
    if (!lines[i].startsWith("@")) return fail();

    const q = lines[i].slice(1); // allow empty q? treat as malformed per "data malformed"
    if (q === "") return fail();
    i++;

    const o = [];
    while (i < lines.length && lines[i].trim() !== "") {
      const line = lines[i].trimEnd();

      if (line.startsWith("$")) {
        const ans = line.slice(1);
        if (ans === "") return fail();
        o.push(ans);
        i++;
        continue;
      }

      if (line.startsWith("#")) break;

      // any other line before # is malformed
      return fail();
    }

    // allow empty lines right before #
    while (i < lines.length && lines[i].trim() === "") i++;

    if (i >= lines.length || !lines[i].startsWith("#")) return fail();

    const nStr = lines[i].slice(1).trim();
    if (nStr === "" || !/^-?\d+$/.test(nStr)) return fail();
    const a = Number(nStr);
    i++;

    if (o.length === 0) return fail();

    entries.push({ q, o, a });
  }

  return entries;
}

function constructQuiz(arr: object) {
  if (!Array.isArray(arr) || arr.length === 0) return "";

  return arr
    .map((entry) => {
      const q = entry?.q;
      const o = entry?.o;
      const a = entry?.a;

      if (typeof q !== "string") return null;
      if (!Array.isArray(o)) return null;
      if (o.some((x) => typeof x !== "string")) return null;
      if (typeof a !== "number" || !Number.isFinite(a)) return null;

      const answers = o.map((s) => `$${s}`).join("\n");
      return `@${q}\n${answers}\n#${a}`;
    })
    .join("\n\n");
}

export default function ItemEdit({ editItem }: ItemEditProps) {
  const [initItem, setInitItem] = useState<Item>();
  const [inputName, setInputName] = useState("");
  const [inputInfo, setInputInfo] = useState("");
  const [inputTech, setInputTech] = useState("");
  const [inputQuiz, setInputQuiz] = useState("");
  const [inputPhoto, setInputPhoto] = useState<File | null>(null);
  const [inputPhotoUrl, setInputPhotoUrl] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      if (editItem) {
        const data = await ApiGetItem(editItem);
        setInitItem(data);
        setInputName(data.name);
        setInputInfo(data.info);
        setInputTech(constructTech(data.tech));
        setInputQuiz(constructQuiz(data.quiz));
        setInputPhotoUrl(data.photo);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const processData = async () => {
      if (inputPhoto) {
        const data = await encodeFileToBase64(inputPhoto);
        setInputPhotoUrl(data);
      } else {
        setInputPhotoUrl(null);
      }
    };

    processData();
  }, [inputPhoto]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!parseTech(inputTech)) {
      toast.danger("Specification data is invalid. Please check formatting.");
      return;
    }
    if (!parseQuiz(inputQuiz)) {
      toast.danger("Quiz data is invalid. Please check formatting.");
      return;
    }
    if (!inputPhotoUrl) {
      toast.danger("Please supply an image.");
      return;
    }
    if (initItem) {
      const editedItem: UpdateItem = {
        name: inputName === initItem.name ? null : inputName,
        info: inputInfo === initItem.info ? null : inputInfo,
        tech:
          parseTech(inputTech) === initItem.tech ? null : parseTech(inputTech),
        quiz:
          parseQuiz(inputQuiz) === initItem.quiz ? null : parseQuiz(inputQuiz),
        photo: inputPhotoUrl === initItem.photo ? null : inputPhotoUrl,
      };
      await ApiUpdateItem(initItem.id, editedItem);
      toast.success(`Updated ${inputName} successfully!`);
      window.location.reload();
    } else {
      const createItem: CreateItem = {
        name: inputName,
        info: inputInfo,
        tech: parseTech(inputTech),
        quiz: parseQuiz(inputQuiz)!,
        photo: inputPhotoUrl!,
      };
      const newItem = await ApiCreateItem(createItem);

      if (newItem) {
        toast.success(`Created ${inputName} successfully!`);
        window.location.reload();
      } else {
        toast.warning(
          `There was an error during creation of ${inputName}. Try again`,
        );
      }
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onPress={() => setIsOpen(true)}>
        {editItem ? (
          <>
            <FaPen /> &nbsp;Edit
          </>
        ) : (
          <>
            <FaPlus /> &nbsp;Create new
          </>
        )}
      </Button>
      <Modal.Backdrop
        isDismissable={false}
        isKeyboardDismissDisabled
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <Modal.Container size="cover">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                {editItem ? "Edit Item" : "Create new Item"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={onSubmit} className="flex flex-col gap-4">
                <TextField
                  isRequired
                  name="name"
                  type="text"
                  validate={(value) => {
                    if (!/^.{0,255}$/i.test(value)) {
                      return "The item's name can't be over 255 characters long.";
                    }

                    return null;
                  }}
                >
                  <Label>Name</Label>
                  <Input
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    variant="secondary"
                  />
                  <FieldError />
                </TextField>
                <TextField
                  isRequired
                  name="info"
                  type="text"
                  validate={(value) => {
                    if (!/^.{0,999}$/i.test(value)) {
                      return "The item's name can't be over 999 characters long.";
                    }

                    return null;
                  }}
                >
                  <Label>Description</Label>
                  <TextArea
                    value={inputInfo}
                    onChange={(e) => setInputInfo(e.target.value)}
                    variant="secondary"
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                  <FieldError />
                </TextField>
                <TextField name="tech" type="text">
                  <div className="flex flex-row items-center">
                    <Label>Specification</Label>
                    &nbsp;
                    <Popover>
                      <Button variant="ghost">
                        <HiInformationCircle />
                      </Button>
                      <Popover.Content className="max-w-64">
                        <Popover.Dialog>
                          <Popover.Arrow />
                          <Popover.Heading>Specification</Popover.Heading>
                          <p className="mt-2 text-sm text-muted">
                            Specifications are created with a property followed
                            by a colon followed by a value and terminated with a
                            new line.
                            <br />
                            Here's an example:
                          </p>
                          <div className="bg-background w-fit p-2">
                            <code>
                              Weight: 1000kg
                              <br />
                              Height: 300cm
                              <br />
                              my Property: my Value
                              <br />
                              x: y
                            </code>
                          </div>
                        </Popover.Dialog>
                      </Popover.Content>
                    </Popover>
                  </div>
                  <TextArea
                    value={inputTech}
                    onChange={(e) => setInputTech(e.target.value)}
                    variant="secondary"
                    rows={6}
                    style={{ resize: "vertical" }}
                  />
                  <FieldError />
                </TextField>
                <TextField name="quiz" type="text">
                  <div className="flex flex-row items-center">
                    <Label>Quiz</Label>
                    &nbsp;
                    <Popover>
                      <Button variant="ghost">
                        <HiInformationCircle />
                      </Button>
                      <Popover.Content className="max-w-64 overflow-scroll">
                        <Popover.Dialog>
                          <Popover.Arrow />
                          <Popover.Heading>Quiz</Popover.Heading>
                          <p className="mt-2 text-sm text-muted">
                            A quiz has a specific set of rules: <br />
                            Quizzes must be defined in this order: Question,
                            Options, Answer. You may create multiple quizzes.{" "}
                            <br />
                            To create a question, write a @ followed by the
                            question. <br />
                            Next, on a new line start with $ followed by an
                            option, repeat this step until you have 2 or more
                            options. Finally on a new line add # followed by the
                            number of the correct option (please note that this
                            is 0-based indexing / the first option will be
                            option 0 and so on) <br />
                            Here's an example:
                          </p>
                          <div className="bg-background w-fit p-2">
                            <code>
                              @In which continent lies Switzerland?
                              <br />
                              $America
                              <br />
                              $Europe
                              <br />
                              $Asia
                              <br />
                              #1
                              <br />
                              @Your question
                              <br />
                              $your wrong option
                              <br />
                              $your 2nd wrong option
                              <br />
                              $your 3rd wrong option
                              <br />
                              $your correct option
                              <br />
                              #3
                            </code>
                          </div>
                        </Popover.Dialog>
                      </Popover.Content>
                    </Popover>
                  </div>
                  <TextArea
                    value={inputQuiz}
                    onChange={(e) => setInputQuiz(e.target.value)}
                    variant="secondary"
                    rows={6}
                    style={{ resize: "vertical" }}
                  />
                  <FieldError />
                </TextField>
                <div className="flex flex-col gap-1 bg-surface-tertiary p-2 rounded-xl">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setInputPhoto(e.target.files?.[0] ?? null)}
                    className="py-2 px-4 bg-accent hover:bg-accent-hover text-background-inverse rounded-3xl"
                  />
                  {inputPhotoUrl && (
                    <img
                      src={inputPhotoUrl}
                      alt="preview"
                      className="w-3xs h-auto rounded-2xl"
                    />
                  )}
                </div>
                <Button type="submit">{editItem ? "Save" : "Create"}</Button>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
