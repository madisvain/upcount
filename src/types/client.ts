export interface Client {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  address?: string;
  emails: string[];
  phone?: string;
  website?: string;
  registration_number?: string;
  vatin?: string;
  createdAt: string;
}