import * as Handlebars from 'handlebars';
import { Transporter, SendMailOptions, SentMessageInfo, createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { readFileSync } from 'fs';

export class Mailer {

    private readonly transporter: Transporter;

    constructor(config: any) {
        this.transporter = createTransport(config);
    }

    send(
        from: string, recipient: string, subject: string, html: string,
        bcc?: string, replyTo?: string, attachments?: Mail.Attachment[],
        success?: (info: any) => void,
        error?: (error: any) => void
    ) {

        const to = recipient;

        const promise: Promise<SentMessageInfo> =
            this.transporter.sendMail({ from, to, subject, html, attachments, bcc, replyTo }) as any;

        promise.then(info => {
            if (success) success(info);
        }, error => {
            if (error) error(error);
        });

        return promise;
    }

    sendWithTemplate(from: string, content: string, replacements: any, recipient: string, subject: string, bcc?: string, replyTo?: string,
        attachments?: Mail.Attachment[], success?: (info: any) => void, error?: (error: any) => void) {

        const template = Handlebars.compile(content);

        return this.send(from, recipient, subject, template(replacements), bcc, replyTo, attachments, success, error);
    }

}
