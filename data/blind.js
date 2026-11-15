// BLIND TEST SET. Synthetic: every message, person, company and domain here is
// made up (domains use the reserved .example TLD). Written and frozen in its own
// commit BEFORE any classifier code existed. Do not edit after that commit.
// Labels: human = interested | referral | not_now | not_interested | unsubscribe | other
//         auto_inbox = out_of_office | left_company | auto_ack
//         pre_inbox = bounce | delayed | gateway_hold

export const BLIND = [
  {
    id: 'b01', provider: 'microsoft', label: 'out_of_office',
    raw: `From: Meera Iyer <meera@harbourline.example>
Subject: Automatic reply: Ops headcount at Harbourline
Auto-Submitted: auto-replied

Hi, I am travelling for the Q4 offsite and will be back on 2 December. For anything urgent please reach Arjun at arjun@harbourline.example.`,
  },
  {
    id: 'b02', provider: 'google', label: 'out_of_office',
    raw: `From: Tom Becker <tom@quillforge.example>
Subject: Re: Quick idea for Quillforge's onboarding

Thanks for your note! I'm on parental leave until mid January with very limited access to email. I'll reply when I'm back.`,
  },
  {
    id: 'b03', provider: 'microsoft', label: 'interested',
    raw: `From: Sana Qureshi <sana@brightmeadow.example>
Subject: RE: Ops headcount at Brightmeadow

I'm technically out of office this week but this is timely. Can you send over a couple of slots for Tuesday or Wednesday next week?

From: Alex Rowe <alex@sender.example>
Sent: Monday, 9 November 2026 10:02
Subject: Ops headcount at Brightmeadow`,
  },
  {
    id: 'b04', provider: 'google', label: 'unsubscribe',
    raw: `From: Paul Ng <paul@ferrostack.example>
Subject: Re: Ferrostack + faster outbound

take me off your list please

Sent from my iPhone`,
  },
  {
    id: 'b05', provider: 'microsoft', label: 'bounce',
    raw: `From: postmaster@outlook.example
Subject: Undeliverable: Ops headcount at Lumen Grid
Content-Type: multipart/report; report-type=delivery-status

Your message to rhea@lumengrid.example couldn't be delivered.
rhea wasn't found at lumengrid.example.
Remote server returned '550 5.1.10 RESOLVER.ADR.RecipientNotFound; Recipient not found by SMTP address lookup'`,
  },
  {
    id: 'b06', provider: 'microsoft', label: 'bounce',
    raw: `From: Microsoft Outlook <postmaster@tidewater.example>
Subject: Undeliverable: A question about Tidewater's SDR team
Content-Type: multipart/report; report-type=delivery-status

Delivery has failed to these recipients or groups:
kai@tidewater.example
Your message was rejected by the recipient's email system because it looked like spam or phishing.
Remote server returned '550 5.7.1 Message rejected due to content restrictions'`,
  },
  {
    id: 'b07', provider: 'google', label: 'delayed',
    raw: `From: Mail Delivery Subsystem <mailer-daemon@googlemail.example>
Subject: Delivery Status Notification (Delay)

This is an automatically generated Delivery Status Notification.
THIS IS A WARNING MESSAGE ONLY. YOU DO NOT NEED TO RESEND YOUR MESSAGE.
Delivery to the following recipient has been delayed: dana@orchidlabs.example
Message will be retried for 2 more day(s).`,
  },
  {
    id: 'b08', provider: 'gateway', label: 'gateway_hold',
    raw: `From: Mail Security <noreply@shield-gw.example>
Subject: Action required: confirm your message to ishaan@corvantis.example

Your message has been held by our email protection service. To release it, please confirm you are a real sender by clicking the link below within 72 hours. Messages that are not confirmed will be deleted.`,
  },
  {
    id: 'b09', provider: 'microsoft', label: 'left_company',
    raw: `From: Rohan Mehta <rohan@pinecrest.example>
Subject: Automatic reply: Pinecrest's outbound
Auto-Submitted: auto-replied

Rohan is no longer with Pinecrest. Please direct sales enquiries to Lina Park at lina.park@pinecrest.example. This mailbox is not monitored.`,
  },
  {
    id: 'b10', provider: 'google', label: 'referral',
    raw: `From: Jo Alvarez <jo@kitebase.example>
Subject: Re: Kitebase pipeline

Not me, I run finance. Our head of growth Vikram (vikram@kitebase.example) owns outbound, try him.

On Tue, Nov 10, 2026 at 9:14 AM Alex Rowe <alex@sender.example> wrote:
> Hi Jo, saw Kitebase is hiring 6 SDRs...
> If this isn't relevant, reply unsubscribe and I won't email again.`,
  },
  {
    id: 'b11', provider: 'gateway', label: 'auto_ack',
    raw: `From: Helix Support <support@helixcare.example>
Subject: [Ticket #48213] We've received your message
Auto-Submitted: auto-generated

Thank you for contacting Helix. This is an automated confirmation that we have received your request. A member of our team will respond within 2 business days.`,
  },
  {
    id: 'b12', provider: 'google', label: 'not_now',
    raw: `From: Grace Kim <grace@oakhollow.example>
Subject: Re: Oak Hollow outbound

We're locked into our current tool until March. Reach back out in Q2 and we can take a look then.`,
  },
  {
    id: 'b13', provider: 'microsoft', label: 'not_interested',
    raw: `From: Dev Sharma <dev@ravelin-steel.example>
Subject: RE: Ravelin Steel outbound

No thanks, we build all our outbound in house and are happy with it.`,
  },
  {
    id: 'b14', provider: 'microsoft', label: 'out_of_office',
    raw: `From: Lukas Weber <lukas@bergwerk.example>
Subject: Automatische Antwort: Bergwerk Vertrieb
Auto-Submitted: auto-replied

Vielen Dank für Ihre Nachricht. Ich bin bis einschließlich 27.11. nicht im Büro und habe keinen Zugriff auf meine E-Mails.`,
  },
  {
    id: 'b15', provider: 'google', label: 'out_of_office',
    raw: `From: Camille Laurent <camille@lumieres.example>
Subject: Absence du bureau

Bonjour, je suis absente jusqu'au 1er décembre. Je répondrai à votre message dès mon retour.`,
  },
  {
    id: 'b16', provider: 'gateway', label: 'interested',
    raw: `From: Omar Haddad <omar@saltbridge.example>
Subject: Re: Saltbridge + signal based outbound

Interesting, we've been burning domains with our current setup. What does pricing look like for 3 SDRs?`,
  },
  {
    id: 'b17', provider: 'gateway', label: 'bounce',
    raw: `From: MAILER-DAEMON@mx.shield-gw.example
Subject: Mail delivery failed: returning message to sender

This message was created automatically by mail delivery software.
A message that you sent could not be delivered to one or more of its recipients. This is a permanent error.
  nora@velacorp.example
    552 5.2.2 Mailbox full`,
  },
  {
    id: 'b18', provider: 'google', label: 'other',
    raw: `From: Ben Ortiz <ben@tallgrass.example>
Subject: Re: Tallgrass outbound

How did you get my email?`,
  },
  {
    id: 'b19', provider: 'microsoft', label: 'auto_ack',
    raw: `From: Info Desk <info@marlowgroup.example>
Subject: Automatic reply: Marlow Group outbound
Auto-Submitted: auto-replied

Thank you for your email to Marlow Group. This inbox is checked daily and your enquiry will be routed to the right team.`,
  },
  {
    id: 'b20', provider: 'google', label: 'interested',
    raw: `From: Priya Nair <priya@sunpath.example>
Subject: Re: Sunpath's SDR hiring

Sure, happy to chat. Thursday 4pm IST works.`,
  },
  {
    id: 'b21', provider: 'microsoft', label: 'unsubscribe',
    raw: `From: Hannah Cole <hannah@greyfield.example>
Subject: RE: Greyfield outbound

Please remove me from all future emails. This is the third one.`,
  },
  {
    id: 'b22', provider: 'gateway', label: 'gateway_hold',
    raw: `From: quarantine@protect-mail.example
Subject: Message quarantined: delivery to felix@arborlane.example pending review

The message you sent was quarantined by the recipient organisation's security policy and has not been delivered. If you believe this is an error, contact the recipient by another channel.`,
  },
  {
    id: 'b23', provider: 'google', label: 'left_company',
    raw: `From: Sofia Rossi <sofia@cobaltwave.example>
Subject: Re: Cobaltwave outbound

Hi there, I've moved on from Cobaltwave and this address will be closed soon. Thanks!`,
  },
  {
    id: 'b24', provider: 'microsoft', label: 'referral',
    raw: `From: Amit Joshi <amit@northpeak.example>
Subject: RE: Northpeak sales team

Looping in Kavya who leads sales ops, she's the right person for this.`,
  },
  {
    id: 'b25', provider: 'google', label: 'out_of_office',
    raw: `From: Ankit Verma <ankit@riverstone.example>
Subject: Out of Office Re: Riverstone outbound
Auto-Submitted: auto-replied

I'm away at a conference until 20 Nov. Expect a delayed response.`,
  },
  {
    id: 'b26', provider: 'microsoft', label: 'delayed',
    raw: `From: postmaster@contoso-mail.example
Subject: Delivery delayed: Ops headcount at Wavecrest
Content-Type: multipart/report; report-type=delivery-status

Delivery of your message to lee@wavecrest.example has been delayed. The server will keep trying to deliver your message for the next 1 day. You'll be notified if the message can't be delivered.`,
  },
  {
    id: 'b27', provider: 'gateway', label: 'not_now',
    raw: `From: Ritu Malhotra <ritu@goldleaf.example>
Subject: Re: Goldleaf outbound

Budget's frozen till the new financial year in April. Ping me then?`,
  },
  {
    id: 'b28', provider: 'microsoft', label: 'interested',
    raw: `From: Chris Doyle <chris@ironvale.example>
Subject: RE: Ironvale pipeline

Yes. Send me the case study you mentioned and we can book something.`,
  },
  {
    id: 'b29', provider: 'google', label: 'auto_ack',
    raw: `From: Careers at Fernhill <jobs@fernhill.example>
Subject: Re: Fernhill outbound

Thanks for reaching out! This is an automated response to let you know we've received your email. Due to high volume we may not be able to reply to every message.`,
  },
  {
    id: 'b30', provider: 'microsoft', label: 'out_of_office',
    raw: `From: Neha Kapoor <neha@stratus-hq.example>
Subject: RE: Stratus outbound

I'm on leave till Monday with no access to email, will respond once back.`,
  },
  {
    id: 'b31', provider: 'gateway', label: 'not_interested',
    raw: `From: Lars Holm <lars@nordgate.example>
Subject: Re: Nordgate outbound

We are not looking for this. Please do not follow up.`,
  },
  {
    id: 'b32', provider: 'google', label: 'bounce',
    raw: `From: Mail Delivery Subsystem <mailer-daemon@googlemail.example>
Subject: Delivery Status Notification (Failure)

Address not found
Your message wasn't delivered to sam@quartzline.example because the address couldn't be found, or is unable to receive mail.
The response was: 550 5.1.1 The email account that you tried to reach does not exist.`,
  },
  {
    id: 'b33', provider: 'microsoft', label: 'left_company',
    raw: `From: Fatima Zahra <fatima@meridia.example>
Subject: Automatic reply: Meridia outbound
Auto-Submitted: auto-replied

Thank you for your message. Please note I left Meridia on 31 October. This mailbox will no longer be monitored.`,
  },
  {
    id: 'b34', provider: 'google', label: 'not_interested',
    raw: `From: Ivy Chen <ivy@lanternworks.example>
Subject: Re: Lanternworks outbound

Appreciate it, but we just signed with another vendor last month.`,
  },
  {
    id: 'b35', provider: 'gateway', label: 'out_of_office',
    raw: `From: Mateo Silva <mateo@costaverde.example>
Subject: Respuesta automática: Costa Verde ventas
Auto-Submitted: auto-replied

Estoy fuera de la oficina hasta el 30 de noviembre. Para asuntos urgentes, escriba a ventas@costaverde.example.`,
  },
  {
    id: 'b36', provider: 'microsoft', label: 'other',
    raw: `From: Ella Grant <ella@birchway.example>
Subject: RE: Birchway outbound

Which company are you with again? Couldn't find you online.`,
  },
  {
    id: 'b37', provider: 'gateway', label: 'gateway_hold',
    raw: `From: Secure Gateway <postmaster@gatekeeper-sec.example>
Subject: Your email to the Ashgrove team is awaiting sender verification

We received a message from you that has not been delivered yet. Our system requires new senders to verify their address once. Reply to this message or click the link to verify.`,
  },
  {
    id: 'b38', provider: 'google', label: 'unsubscribe',
    raw: `From: Rafael Costa <rafael@mosswood.example>
Subject: Re: Mosswood outbound

unsubscribe`,
  },
  {
    id: 'b39', provider: 'microsoft', label: 'interested',
    raw: `From: Divya Rao <divya@cedarline.example>
Subject: RE: Cedarline's outbound

Back from leave today and saw this. Yes, keen to see a demo, can you do Friday?

From: Alex Rowe <alex@sender.example>
Sent: Monday, 2 November 2026 11:30
Subject: Cedarline's outbound
To unsubscribe from these emails, reply STOP.`,
  },
  {
    id: 'b40', provider: 'google', label: 'not_now',
    raw: `From: Karan Gill <karan@bluefin.example>
Subject: Re: Bluefin outbound

Not a priority right now, maybe next quarter.`,
  },
];
