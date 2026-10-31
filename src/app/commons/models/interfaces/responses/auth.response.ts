

export interface AuthResponse {

  token: string;
  email: string;
  username: string;
  name: string;
  lastname: string;
  uid: string;
  status: string;
  statusLabel: string;
  created: number;
  createdLabel: string;

  workspace: {
    created: number;
    createdLabel: string;
    name: string;
    status: string;
    uid: string;
  }

  person: {
    created: number;
    createdLabel: string;
    status: string;
    uid: string;
  }

}

