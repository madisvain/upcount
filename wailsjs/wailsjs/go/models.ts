export namespace db {
	
	export class Client {
	    id: string;
	    organizationId: string;
	    name?: string;
	    code?: string;
	    address?: string;
	    emails?: string;
	    phone?: string;
	    website?: string;
	    registration_number?: string;
	    vatin?: string;
	    createdAt?: string;
	
	    static createFrom(source: any = {}) {
	        return new Client(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.name = source["name"];
	        this.code = source["code"];
	        this.address = source["address"];
	        this.emails = source["emails"];
	        this.phone = source["phone"];
	        this.website = source["website"];
	        this.registration_number = source["registration_number"];
	        this.vatin = source["vatin"];
	        this.createdAt = source["createdAt"];
	    }
	}
	export class CreateClientRequest {
	    id: string;
	    organizationId: string;
	    name?: string;
	    code?: string;
	    address?: string;
	    emails?: string;
	    phone?: string;
	    website?: string;
	    registration_number?: string;
	    vatin?: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateClientRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.name = source["name"];
	        this.code = source["code"];
	        this.address = source["address"];
	        this.emails = source["emails"];
	        this.phone = source["phone"];
	        this.website = source["website"];
	        this.registration_number = source["registration_number"];
	        this.vatin = source["vatin"];
	    }
	}
	export class CreateInvoiceLineItemRequest {
	    description?: string;
	    quantity: number;
	    unitPrice: number;
	    taxRate?: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateInvoiceLineItemRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.description = source["description"];
	        this.quantity = source["quantity"];
	        this.unitPrice = source["unitPrice"];
	        this.taxRate = source["taxRate"];
	    }
	}
	export class CreateInvoiceRequest {
	    id: string;
	    organizationId: string;
	    number: string;
	    state: string;
	    clientId: string;
	    date: number;
	    dueDate?: number;
	    currency: string;
	    customerNotes?: string;
	    overdueCharge?: number;
	    total: number;
	    taxTotal: number;
	    subTotal: number;
	    lineItems: CreateInvoiceLineItemRequest[];
	
	    static createFrom(source: any = {}) {
	        return new CreateInvoiceRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.number = source["number"];
	        this.state = source["state"];
	        this.clientId = source["clientId"];
	        this.date = source["date"];
	        this.dueDate = source["dueDate"];
	        this.currency = source["currency"];
	        this.customerNotes = source["customerNotes"];
	        this.overdueCharge = source["overdueCharge"];
	        this.total = source["total"];
	        this.taxTotal = source["taxTotal"];
	        this.subTotal = source["subTotal"];
	        this.lineItems = this.convertValues(source["lineItems"], CreateInvoiceLineItemRequest);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CreateOrganizationRequest {
	    id: string;
	    name?: string;
	    country?: string;
	    address?: string;
	    email?: string;
	    phone?: string;
	    website?: string;
	    registration_number?: string;
	    vatin?: string;
	    bank_name?: string;
	    iban?: string;
	    currency?: string;
	    minimum_fraction_digits?: number;
	    due_days?: number;
	    overdueCharge?: number;
	    customerNotes?: string;
	    logo: number[];
	    invoiceNumberFormat?: string;
	    date_format?: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateOrganizationRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.country = source["country"];
	        this.address = source["address"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.website = source["website"];
	        this.registration_number = source["registration_number"];
	        this.vatin = source["vatin"];
	        this.bank_name = source["bank_name"];
	        this.iban = source["iban"];
	        this.currency = source["currency"];
	        this.minimum_fraction_digits = source["minimum_fraction_digits"];
	        this.due_days = source["due_days"];
	        this.overdueCharge = source["overdueCharge"];
	        this.customerNotes = source["customerNotes"];
	        this.logo = source["logo"];
	        this.invoiceNumberFormat = source["invoiceNumberFormat"];
	        this.date_format = source["date_format"];
	    }
	}
	export class CreateProjectRequest {
	    id: string;
	    organizationId: string;
	    name: string;
	    clientId?: string;
	    startDate?: number;
	    endDate?: number;
	    archivedAt?: number;
	
	    static createFrom(source: any = {}) {
	        return new CreateProjectRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.name = source["name"];
	        this.clientId = source["clientId"];
	        this.startDate = source["startDate"];
	        this.endDate = source["endDate"];
	        this.archivedAt = source["archivedAt"];
	    }
	}
	export class CreateTagRequest {
	    id: string;
	    organizationId: string;
	    name: string;
	    color: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateTagRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.name = source["name"];
	        this.color = source["color"];
	    }
	}
	export class CreateTaxRateRequest {
	    id: string;
	    organizationId: string;
	    name: string;
	    description?: string;
	    percentage: number;
	    isDefault?: number;
	
	    static createFrom(source: any = {}) {
	        return new CreateTaxRateRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.percentage = source["percentage"];
	        this.isDefault = source["isDefault"];
	    }
	}
	export class CreateTimeEntryRequest {
	    id: string;
	    organizationId: string;
	    clientId?: string;
	    projectId?: string;
	    description?: string;
	    startTime: number;
	    endTime?: number;
	    duration: number;
	    tags?: string;
	    isBillable: number;
	    hourlyRate?: number;
	
	    static createFrom(source: any = {}) {
	        return new CreateTimeEntryRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.clientId = source["clientId"];
	        this.projectId = source["projectId"];
	        this.description = source["description"];
	        this.startTime = source["startTime"];
	        this.endTime = source["endTime"];
	        this.duration = source["duration"];
	        this.tags = source["tags"];
	        this.isBillable = source["isBillable"];
	        this.hourlyRate = source["hourlyRate"];
	    }
	}
	export class Invoice {
	    id: string;
	    organizationId: string;
	    number: string;
	    state: string;
	    clientId: string;
	    date: number;
	    dueDate?: number;
	    currency: string;
	    customerNotes?: string;
	    overdueCharge?: number;
	    total: number;
	    taxTotal: number;
	    subTotal: number;
	    createdAt?: string;
	    clientName?: string;
	
	    static createFrom(source: any = {}) {
	        return new Invoice(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.number = source["number"];
	        this.state = source["state"];
	        this.clientId = source["clientId"];
	        this.date = source["date"];
	        this.dueDate = source["dueDate"];
	        this.currency = source["currency"];
	        this.customerNotes = source["customerNotes"];
	        this.overdueCharge = source["overdueCharge"];
	        this.total = source["total"];
	        this.taxTotal = source["taxTotal"];
	        this.subTotal = source["subTotal"];
	        this.createdAt = source["createdAt"];
	        this.clientName = source["clientName"];
	    }
	}
	export class InvoiceLineItem {
	    id: string;
	    invoiceId: string;
	    description?: string;
	    quantity: number;
	    unitPrice: number;
	    taxRate?: string;
	    position: number;
	    createdAt?: string;
	
	    static createFrom(source: any = {}) {
	        return new InvoiceLineItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.invoiceId = source["invoiceId"];
	        this.description = source["description"];
	        this.quantity = source["quantity"];
	        this.unitPrice = source["unitPrice"];
	        this.taxRate = source["taxRate"];
	        this.position = source["position"];
	        this.createdAt = source["createdAt"];
	    }
	}
	export class Organization {
	    id: string;
	    name?: string;
	    country?: string;
	    address?: string;
	    email?: string;
	    phone?: string;
	    website?: string;
	    registration_number?: string;
	    vatin?: string;
	    bank_name?: string;
	    iban?: string;
	    currency?: string;
	    minimum_fraction_digits?: number;
	    due_days?: number;
	    overdueCharge?: number;
	    customerNotes?: string;
	    createdAt?: string;
	    logo: number[];
	    invoiceNumberFormat?: string;
	    invoiceNumberCounter?: number;
	    date_format?: string;
	
	    static createFrom(source: any = {}) {
	        return new Organization(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.country = source["country"];
	        this.address = source["address"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.website = source["website"];
	        this.registration_number = source["registration_number"];
	        this.vatin = source["vatin"];
	        this.bank_name = source["bank_name"];
	        this.iban = source["iban"];
	        this.currency = source["currency"];
	        this.minimum_fraction_digits = source["minimum_fraction_digits"];
	        this.due_days = source["due_days"];
	        this.overdueCharge = source["overdueCharge"];
	        this.customerNotes = source["customerNotes"];
	        this.createdAt = source["createdAt"];
	        this.logo = source["logo"];
	        this.invoiceNumberFormat = source["invoiceNumberFormat"];
	        this.invoiceNumberCounter = source["invoiceNumberCounter"];
	        this.date_format = source["date_format"];
	    }
	}
	export class Project {
	    id: string;
	    organizationId: string;
	    name: string;
	    clientId?: string;
	    clientName?: string;
	    startDate?: number;
	    endDate?: number;
	    archivedAt?: number;
	    createdAt?: string;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.name = source["name"];
	        this.clientId = source["clientId"];
	        this.clientName = source["clientName"];
	        this.startDate = source["startDate"];
	        this.endDate = source["endDate"];
	        this.archivedAt = source["archivedAt"];
	        this.createdAt = source["createdAt"];
	    }
	}
	export class Tag {
	    id: string;
	    organizationId: string;
	    name: string;
	    color: string;
	    createdAt?: string;
	
	    static createFrom(source: any = {}) {
	        return new Tag(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.name = source["name"];
	        this.color = source["color"];
	        this.createdAt = source["createdAt"];
	    }
	}
	export class TaxRate {
	    id: string;
	    organizationId: string;
	    name: string;
	    description?: string;
	    percentage: number;
	    isDefault?: number;
	
	    static createFrom(source: any = {}) {
	        return new TaxRate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.percentage = source["percentage"];
	        this.isDefault = source["isDefault"];
	    }
	}
	export class TimeEntry {
	    id: string;
	    organizationId: string;
	    clientId?: string;
	    projectId?: string;
	    description?: string;
	    startTime: number;
	    endTime?: number;
	    duration: number;
	    tags?: string;
	    isBillable: number;
	    hourlyRate?: number;
	    createdAt?: string;
	    clientName?: string;
	
	    static createFrom(source: any = {}) {
	        return new TimeEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.organizationId = source["organizationId"];
	        this.clientId = source["clientId"];
	        this.projectId = source["projectId"];
	        this.description = source["description"];
	        this.startTime = source["startTime"];
	        this.endTime = source["endTime"];
	        this.duration = source["duration"];
	        this.tags = source["tags"];
	        this.isBillable = source["isBillable"];
	        this.hourlyRate = source["hourlyRate"];
	        this.createdAt = source["createdAt"];
	        this.clientName = source["clientName"];
	    }
	}
	export class UpdateClientRequest {
	    name?: string;
	    code?: string;
	    address?: string;
	    emails?: string;
	    phone?: string;
	    website?: string;
	    registration_number?: string;
	    vatin?: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateClientRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.code = source["code"];
	        this.address = source["address"];
	        this.emails = source["emails"];
	        this.phone = source["phone"];
	        this.website = source["website"];
	        this.registration_number = source["registration_number"];
	        this.vatin = source["vatin"];
	    }
	}
	export class UpdateInvoiceRequest {
	    number?: string;
	    state?: string;
	    clientId?: string;
	    date?: number;
	    dueDate?: number;
	    currency?: string;
	    customerNotes?: string;
	    overdueCharge?: number;
	    total?: number;
	    taxTotal?: number;
	    subTotal?: number;
	    lineItems?: CreateInvoiceLineItemRequest[];
	
	    static createFrom(source: any = {}) {
	        return new UpdateInvoiceRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.number = source["number"];
	        this.state = source["state"];
	        this.clientId = source["clientId"];
	        this.date = source["date"];
	        this.dueDate = source["dueDate"];
	        this.currency = source["currency"];
	        this.customerNotes = source["customerNotes"];
	        this.overdueCharge = source["overdueCharge"];
	        this.total = source["total"];
	        this.taxTotal = source["taxTotal"];
	        this.subTotal = source["subTotal"];
	        this.lineItems = this.convertValues(source["lineItems"], CreateInvoiceLineItemRequest);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class UpdateOrganizationRequest {
	    name?: string;
	    country?: string;
	    address?: string;
	    email?: string;
	    phone?: string;
	    website?: string;
	    registration_number?: string;
	    vatin?: string;
	    bank_name?: string;
	    iban?: string;
	    currency?: string;
	    minimum_fraction_digits?: number;
	    due_days?: number;
	    overdueCharge?: number;
	    customerNotes?: string;
	    logo: number[];
	    invoiceNumberFormat?: string;
	    invoiceNumberCounter?: number;
	    date_format?: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateOrganizationRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.country = source["country"];
	        this.address = source["address"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.website = source["website"];
	        this.registration_number = source["registration_number"];
	        this.vatin = source["vatin"];
	        this.bank_name = source["bank_name"];
	        this.iban = source["iban"];
	        this.currency = source["currency"];
	        this.minimum_fraction_digits = source["minimum_fraction_digits"];
	        this.due_days = source["due_days"];
	        this.overdueCharge = source["overdueCharge"];
	        this.customerNotes = source["customerNotes"];
	        this.logo = source["logo"];
	        this.invoiceNumberFormat = source["invoiceNumberFormat"];
	        this.invoiceNumberCounter = source["invoiceNumberCounter"];
	        this.date_format = source["date_format"];
	    }
	}
	export class UpdateProjectRequest {
	    name?: string;
	    clientId?: string;
	    startDate?: number;
	    endDate?: number;
	    archivedAt?: number;
	
	    static createFrom(source: any = {}) {
	        return new UpdateProjectRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.clientId = source["clientId"];
	        this.startDate = source["startDate"];
	        this.endDate = source["endDate"];
	        this.archivedAt = source["archivedAt"];
	    }
	}
	export class UpdateTagRequest {
	    name?: string;
	    color?: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateTagRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.color = source["color"];
	    }
	}
	export class UpdateTaxRateRequest {
	    name?: string;
	    description?: string;
	    percentage?: number;
	    isDefault?: number;
	
	    static createFrom(source: any = {}) {
	        return new UpdateTaxRateRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.description = source["description"];
	        this.percentage = source["percentage"];
	        this.isDefault = source["isDefault"];
	    }
	}
	export class UpdateTimeEntryRequest {
	    clientId?: string;
	    projectId?: string;
	    description?: string;
	    startTime?: number;
	    endTime?: number;
	    duration?: number;
	    tags?: string;
	    isBillable?: number;
	    hourlyRate?: number;
	
	    static createFrom(source: any = {}) {
	        return new UpdateTimeEntryRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.clientId = source["clientId"];
	        this.projectId = source["projectId"];
	        this.description = source["description"];
	        this.startTime = source["startTime"];
	        this.endTime = source["endTime"];
	        this.duration = source["duration"];
	        this.tags = source["tags"];
	        this.isBillable = source["isBillable"];
	        this.hourlyRate = source["hourlyRate"];
	    }
	}

}

