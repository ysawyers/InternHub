import { Accessor, Component, JSX, Setter, Show } from "solid-js";

type OptionsModalProps = {
  children: JSX.Element;
  displayModal: Accessor<boolean>;
  setDisplayModal: Setter<boolean>;
};

export const OptionsModal: Component<OptionsModalProps> = ({ children, displayModal, setDisplayModal }) => {
  return (
    <>
      <Show when={displayModal()}>
        <div class="absolute h-[100%] w-[100%] bg-black/25" onClick={() => setDisplayModal(false)}></div>
        <section class="options-modal">
          <header class="text-md rounded-t-lg border-b bg-[#1B2234] p-4 font-bold text-white">Options</header>
          <div class="rounded-b-lg bg-white">{children}</div>
        </section>
      </Show>
    </>
  );
};
