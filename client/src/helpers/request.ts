import { useRequestContext } from "../contexts/RequestProvider";
import { useNavigate } from "@solidjs/router";
import { cookieStorage } from "@solid-primitives/storage";
import jwt_decode, { JwtPayload } from "jwt-decode";
import axios from "axios";

export interface Request {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  headers?: any;
  withCredentials?: boolean;
}

const { VITE_SERVER_DOMAIN } = import.meta.env;

const refreshToken = async (): Promise<string> => {
  const { data } = await axios.get(`${VITE_SERVER_DOMAIN}/public/refresh-token`, {
    withCredentials: true,
  });
  return data;
};

export const sendRequest = async ({
  url,
  method,
  data = {},
  headers = {},
  withCredentials = false,
}: Request) => {
  const { accessToken, setAccessToken } = useRequestContext();
  const navigate = useNavigate();

  try {
    if (!accessToken()) {
      setAccessToken(await refreshToken());
    }

    const { exp } = jwt_decode<JwtPayload>(accessToken());
    if (new Date(exp! * 1000).getTime() < new Date().getTime()) {
      setAccessToken(await refreshToken());
    }
  } catch {
    setAccessToken("");
    navigate("/login", { replace: true });
  }

  try {
    const res = await axios({
      method,
      url,
      data,
      headers: {
        Authorization: accessToken(),
        ...headers,
      },
      withCredentials,
    });

    return res.data;
  } catch (error: any) {
    throw new Error(error?.message);
  }
};

export const redirectAuthenticatedUser = async () => {
  const { accessToken, setAccessToken } = useRequestContext();
  const navigate = useNavigate();

  try {
    if (!accessToken()) {
      setAccessToken(await refreshToken());
    }
  } catch (error: any) {}

  if (!!accessToken()) {
    navigate("/explore/home", { replace: true });
  }
};
