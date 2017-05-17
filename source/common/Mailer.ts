import * as Handlebars from 'handlebars';
import * as mailer from 'nodemailer';
import { readFileSync } from 'fs';

import AttachmentObject = mailer.AttachmentObject;
import SentMessageInfo = mailer.SentMessageInfo;

export class Mailer {

    private readonly transporter: mailer.Transporter;

    constructor(config: any) {
        this.transporter = mailer.createTransport(config);
    }


    send(from: string, recipient: string, subject: string, html: string, bcc?: string, replyTo?: string,
         attachments?: AttachmentObject[], success?: (info: any) => void, error?: (error: any) => void) {

        const to = recipient;

        const promise: Promise<mailer.SentMessageInfo> =
                  this.transporter.sendMail({from, to, subject, html, attachments, bcc, replyTo}) as any;

        promise.then(info => {
            if (success) success(info);
        }, error => {
            if (error) error(error);
        });

        return promise;
    }

    sendWithTemplate(from: string, content: string, replacements: any, recipient: string, subject: string, bcc?: string, replyTo?: string,
                     attachments?: AttachmentObject[], success?: (info: any) => void, error?: (error: any) => void) {

        const template = Handlebars.compile(content);

        return this.send(from, recipient, subject, template(replacements), bcc, replyTo, attachments, success, error);
    }

}
