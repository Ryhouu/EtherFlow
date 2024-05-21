import { useSession, signIn, signOut } from "next-auth/react";
import React, { useState, useEffect } from 'react';
import { gmail_v1 } from 'googleapis';

type Message = gmail_v1.Schema$Message;

type ParsedEmail = {
    id: string;
    subject: string;
    snippet: string;
    from: string;
    date: string;
}

async function loadAllEmails(messages: Message[]): Promise<Email[]> {
    const res = await Promise.all(messages.map(msg =>
        fetch(`/api/gmail/fetchEmailMessageContent?messageId=${msg.id}`).then(res => res.json())
    ));
    return res; 
}

function getEmailSubject(email: Email) {
    const headers = email.payload.headers;
    const subjectHeader = headers.find(header => header.name.toLowerCase() === 'subject');
    return subjectHeader ? subjectHeader.value : 'No Subject';
}

function parseEmailData(email: Email) {
    const id = email.id;
    const subject = getEmailSubject(email);
    const snippet = email.snippet;
    const fromHeader = email.payload.headers.find(header => header.name.toLowerCase() === 'from');
    const dateHeader = email.payload.headers.find(header => header.name.toLowerCase() === 'date');

    return {
        id,
        subject,
        snippet,
        from: fromHeader ? fromHeader.value : 'Unknown Sender',
        date: dateHeader ? dateHeader.value : 'Unknown Date'
    };
}

function parseAllEmails(emails: Email[]) {
    const parsedEmails = emails.map(email => parseEmailData(email))
    return parsedEmails; 
}

const FetchEmailsPage = () => {
    const { data: session, status } = useSession();
    const [messages, setMessages] = useState<Message[]>([])
    const [parsedEmails, setParsedEmails] = useState<ParsedEmail[]>([])

    console.log("Session:", session);
    console.log("Session status:", status);

    const fetchEmails = async () => {
        if (!session) {
            signIn();
            return;
        }
    
        const res = await fetch('/api/gmail/FetchEmailsList')
        const data = await res.json();
        if (res.ok) {
            setMessages(data.messages)
            console.log("Messages", messages);
        } else {
            console.error('Failed to fetch email messages:', data);
            alert("Failed to fetch emails");
        }
    };

    // useEffect(() => {
    //     if (session && messages) {
    //         console.log("Updated Messages:", messages)
    //         loadAllEmails(messages).then(emails => {
    //             setParsedEmails(parseAllEmails(emails));
    //         });
    //     }
    // }, [session, messages])

    return (
        <div>
            <h1>Reading Emails</h1>
            <button onClick={fetchEmails}>Load Emails</button>
            <div>
                {parsedEmails.map(email => (
                <div key={email.id}>
                    <h4>{email.subject}</h4>
                    <p>{email.snippet}</p>
                </div>
                ))}
            </div>
        </div>
    );
};

export default FetchEmailsPage;
