type Header = {
    name: string;
    value: string;
};

type Payload = {
    headers: Header[];
};

type Email = {
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    historyId: string;
    internalDate: string;
    payload: Payload;
    sizeEstimate: number;
    raw?: string; // Include only if you are using the 'format=raw' parameter
};
