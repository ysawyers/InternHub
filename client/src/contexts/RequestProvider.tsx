import { createContext, useContext, createSignal, Setter, Accessor } from "solid-js";

interface ContextProps {
  accessToken: Accessor<string>;
  setAccessToken: Setter<string>;
}

const RequestContext = createContext<ContextProps>();

export const RequestProvider = (props: any) => {
  const [accessToken, setAccessToken] = createSignal("");

  return (
    <RequestContext.Provider value={{ accessToken, setAccessToken }}>
      {props.children}
    </RequestContext.Provider>
  );
};

export const useRequestContext = () => useContext(RequestContext)!;
