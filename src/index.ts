import axios, { AxiosError, AxiosResponse } from "axios";

/**
 * Client for calling admin endpoints on a Sigpair node.
 */
export class SigpairAdmin {
  baseUrl: string;
  adminToken: string;

  /**
   *
   * @param baseUrl Base url of the Sigpair node
   * @param adminToken Admin token for the Sigpair node
   */
  constructor(baseUrl: string, adminToken: string) {
    this.baseUrl = baseUrl;
    this.adminToken = adminToken;
  }

  private async createPostRequest(route: string): Promise<[string, any]> {
    const url = `${this.baseUrl}/${route}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.adminToken}`,
    };

    return [url, headers];
  }

  /**
   * Create a new user.
   * @param name Name of the user to create
   * @returns User id of the created user
   */
  async createUser(name: string): Promise<number> {
    const [url, headers] = await this.createPostRequest("v1/create-user");
    const createPayload: CreateUserPayload = {
      name,
    };
    const response = await handleRequest<CreateUserPayload, CreateUserResponse>(
      url,
      headers,
      createPayload
    );

    return response.user_id;
  }

  /**
   * Generate a user token for a user.
   * @param userId Create a token for a user with this id
   * @param lifetime Lifetime of the token in seconds. Defaults to 3600 seconds (1 hour)
   * @returns User token that can be used to authenticate as the user and perform actions.
   */
  async genUserToken(userId: number, lifetime?: number): Promise<string> {
    const [url, headers] = await this.createPostRequest("v1/user-token");
    const createPayload: GenUserTokenPayload = {
      user_id: userId,
      lifetime: lifetime ?? 3600,
    };
    const response = await handleRequest<
      GenUserTokenPayload,
      GenUserTokenResponse
    >(url, headers, createPayload);

    return response.token;
  }
}

async function handleRequest<P, R>(
  url: string,
  headers: any,
  payload: P
): Promise<R> {
  try {
    const response: AxiosResponse<R, any> = await axios.post(url, payload, {
      headers,
    });

    if (response.status == 200) {
      return response.data;
    } else {
      throw new Error(
        `Failed to make request, error:${response.statusText}, code: ${response.status}`
      );
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        `Failed to make request, error:${error.response?.statusText}, code: ${error.response?.status}`
      );
    } else {
      throw new Error(`Failed to make request, error:${error}`);
    }
  }
}

/**
 * Create user response
 */
export type CreateUserResponse = {
  /**
   * User id of the created user
   */
  user_id: number;
};

/**
 * Create user payload
 */
export type CreateUserPayload = {
  /**
   * Name of the user to create
   */
  name: string;
};

/**
 * Generate user token payload
 */
export type GenUserTokenPayload = {
  /**
   * User id of the user to generate a token for
   */
  user_id: number;
  /**
   * Lifetime of the token in seconds
   */
  lifetime: number;
};

/**
 * Generate user token response
 */
export type GenUserTokenResponse = {
  /**
   * User token that can be used to authenticate as the user and perform actions.
   */
  token: string;
};

async function main() {
  const client = new SigpairAdmin(
    "http://localhost:8080",
    "1ec3804afc23258f767b9d38825dc7ab0a2ea44ef4adf3254e4d7c6059c3b55a"
  );
  const userId = await client.createUser("John Doe");
  const token = await client.genUserToken(10000, 3600);
  console.log(userId);
  console.log(token);
}
main();
