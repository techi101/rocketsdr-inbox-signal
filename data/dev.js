// DEV SET (used to write and tune the rules). Synthetic: all people, companies and
// domains are made up (.example TLD). Same label scheme as blind.js.

export const DEV = [
  // ---------- out_of_office ----------
  { id: 'd01', provider: 'microsoft', label: 'out_of_office', raw: `From: Ravi Menon <ravi@acmeport.example>
Subject: Automatic reply: Acmeport outbound
Auto-Submitted: auto-replied

I'm out of the office until 24 November with limited access to email. For urgent matters contact ops@acmeport.example.` },
  { id: 'd02', provider: 'google', label: 'out_of_office', raw: `From: Julia Hart <julia@blueowl.example>
Subject: Out of office

Hello! I'm currently on vacation and will return on Dec 3. I will respond to your email as soon as possible.` },
  { id: 'd03', provider: 'google', label: 'out_of_office', raw: `From: Kabir Shah <kabir@cinder.example>
Subject: Re: Cinder SDR hiring

Thank you for your email. I am on annual leave and will be back on 1 December. Responses will be delayed.` },
  { id: 'd04', provider: 'microsoft', label: 'out_of_office', raw: `From: Anna Schmidt <anna@kraftwerk.example>
Subject: Automatische Antwort: Kraftwerk outbound
Auto-Submitted: auto-replied

Ich bin derzeit nicht im Büro und ab dem 2. Dezember wieder erreichbar.` },
  { id: 'd05', provider: 'gateway', label: 'out_of_office', raw: `From: Pierre Martin <pierre@lyonnaise.example>
Subject: Réponse automatique : Lyonnaise ventes
Auto-Submitted: auto-replied

Je suis absent du bureau jusqu'au 25 novembre. Merci de contacter mon équipe en cas d'urgence.` },
  { id: 'd06', provider: 'microsoft', label: 'out_of_office', raw: `From: Ishita Bose <ishita@corallium.example>
Subject: RE: Corallium outbound

Hi, I'm away on maternity leave until February 2027 and not checking email.` },
  { id: 'd07', provider: 'google', label: 'out_of_office', raw: `From: Marco Bianchi <marco@vespera.example>
Subject: Fuori sede

Sono fuori ufficio fino al 28 novembre, risponderò al mio rientro.` },
  { id: 'd08', provider: 'gateway', label: 'out_of_office', raw: `From: Zoe Turner <zoe@hollowpine.example>
Subject: Re: Hollow Pine outbound
X-Autoreply: yes

Thanks for getting in touch. I'm travelling with patchy connection this week and will get back to you next Monday.` },
  { id: 'd09', provider: 'microsoft', label: 'out_of_office', raw: `From: Vikas Rao <vikas@sterling-ops.example>
Subject: Automatic reply: Sterling outbound
Auto-Submitted: auto-replied

I am currently out of office on public holiday and will reply on my return.` },
  { id: 'd10', provider: 'google', label: 'out_of_office', raw: `From: Lucia Gomez <lucia@solaris.example>
Subject: Fuera de la oficina

Gracias por su mensaje. Estoy de vacaciones hasta el 2 de diciembre.` },

  // ---------- left_company ----------
  { id: 'd11', provider: 'microsoft', label: 'left_company', raw: `From: Greg Lowe <greg@ambergate.example>
Subject: Automatic reply: Ambergate outbound
Auto-Submitted: auto-replied

Greg Lowe has left Ambergate. Please contact sales@ambergate.example for any queries.` },
  { id: 'd12', provider: 'google', label: 'left_company', raw: `From: Nina Patel <nina@quickline.example>
Subject: Re: Quickline outbound

I no longer work at Quickline. Please reach out to Arun (arun@quickline.example) who has taken over my accounts.` },
  { id: 'd13', provider: 'gateway', label: 'left_company', raw: `From: Ola Nordmann <ola@fjordtech.example>
Subject: No longer at Fjordtech
Auto-Submitted: auto-replied

This employee is no longer with the company. Your email has not been forwarded.` },
  { id: 'd14', provider: 'microsoft', label: 'left_company', raw: `From: Pooja Singh <pooja@veridian.example>
Subject: RE: Veridian outbound

Thanks for your email. I have moved on from Veridian, my last day was 30 October.` },

  // ---------- auto_ack ----------
  { id: 'd15', provider: 'gateway', label: 'auto_ack', raw: `From: Support <help@zentrix.example>
Subject: [Request received] Zentrix outbound
Auto-Submitted: auto-generated

We have received your request (#99812). Our team will get back to you shortly. Please do not reply to this email.` },
  { id: 'd16', provider: 'google', label: 'auto_ack', raw: `From: Hello <hello@pebble-ai.example>
Subject: Re: Pebble outbound

Thanks for your message! This is an automatic reply to confirm we got it. Someone from the team will be in touch within 48 hours.` },
  { id: 'd17', provider: 'microsoft', label: 'auto_ack', raw: `From: Sales <sales@gridworks.example>
Subject: Automatic reply: Gridworks outbound
Auto-Submitted: auto-replied

Thanks for contacting Gridworks sales. Your message has been received and will be assigned to an account executive.` },

  // ---------- bounce ----------
  { id: 'd18', provider: 'google', label: 'bounce', raw: `From: Mail Delivery Subsystem <mailer-daemon@googlemail.example>
Subject: Delivery Status Notification (Failure)

Your message wasn't delivered to max@nimbus.example because the address couldn't be found.
550 5.1.1 The email account that you tried to reach does not exist.` },
  { id: 'd19', provider: 'microsoft', label: 'bounce', raw: `From: postmaster@zephyrco.example
Subject: Undeliverable: Zephyr outbound
Content-Type: multipart/report; report-type=delivery-status

Delivery has failed to these recipients or groups:
ian@zephyrco.example
The email address you entered couldn't be found.
550 5.1.10 RESOLVER.ADR.RecipientNotFound` },
  { id: 'd20', provider: 'microsoft', label: 'bounce', raw: `From: Microsoft Outlook <postmaster@lattice-group.example>
Subject: Undeliverable: Lattice outbound
Content-Type: multipart/report; report-type=delivery-status

Your message to ana@lattice-group.example couldn't be delivered.
The recipient's organisation has blocked your message because it was flagged as possible phishing.
550 5.7.1 Service unavailable; Client host blocked using spam filter` },
  { id: 'd21', provider: 'gateway', label: 'bounce', raw: `From: MAILER-DAEMON@relay.secure-mx.example
Subject: Undelivered Mail Returned to Sender

This is the mail system at host relay.secure-mx.example.
I'm sorry to have to inform you that your message could not be delivered to one or more recipients.
<raj@tundra.example>: host said: 550 5.7.1 Message rejected by policy` },
  { id: 'd22', provider: 'google', label: 'bounce', raw: `From: Mail Delivery Subsystem <mailer-daemon@googlemail.example>
Subject: Delivery Status Notification (Failure)

Message blocked. Your message to eve@hillcrest.example has been blocked. See technical details below.
552 5.2.2 The recipient's inbox is out of storage space.` },
  { id: 'd23', provider: 'microsoft', label: 'bounce', raw: `From: postmaster@bayside.example
Subject: Undeliverable: Bayside outbound
Content-Type: multipart/report; report-type=delivery-status

Delivery to the following recipients failed permanently: tim@bayside.example
554 5.4.14 Hop count exceeded - possible mail loop` },

  // ---------- delayed ----------
  { id: 'd24', provider: 'google', label: 'delayed', raw: `From: Mail Delivery Subsystem <mailer-daemon@googlemail.example>
Subject: Delivery Status Notification (Delay)

THIS IS A WARNING MESSAGE ONLY. YOU DO NOT NEED TO RESEND YOUR MESSAGE.
Delivery to joe@ridgeway.example has been delayed. We'll retry for up to 48 hours.` },
  { id: 'd25', provider: 'microsoft', label: 'delayed', raw: `From: postmaster@fabrikam-mail.example
Subject: Delivery delayed: Halcyon outbound
Content-Type: multipart/report; report-type=delivery-status

Delivery is delayed to these recipients or groups: mia@halcyon.example
This message hasn't been delivered yet. Delivery will continue to be attempted.` },
  { id: 'd26', provider: 'gateway', label: 'delayed', raw: `From: MAILER-DAEMON@mx2.filterhub.example
Subject: Warning: message delayed

This is an automatically generated message. Your message to ken@sablewood.example has not been delivered for 4 hours. The mail system will continue trying to deliver it. No action is required.` },

  // ---------- gateway_hold ----------
  { id: 'd27', provider: 'gateway', label: 'gateway_hold', raw: `From: Email Protection <verify@sentinel-mail.example>
Subject: Please verify your email to orla@westbrook.example

This recipient uses a sender verification service. Your message is pending until you verify your address by clicking the link below.` },
  { id: 'd28', provider: 'gateway', label: 'gateway_hold', raw: `From: quarantine@safemail-gw.example
Subject: Message held for review

Your message to jay@pinnacle.example has been placed in quarantine by the recipient's mail security system and has not been delivered.` },
  { id: 'd29', provider: 'gateway', label: 'gateway_hold', raw: `From: noreply@trustwall.example
Subject: Confirm you're human to deliver your message

We protect this mailbox from spam. Click to confirm you are a human sender and your message to ruth@elmstead.example will be delivered.` },
  { id: 'd30', provider: 'microsoft', label: 'gateway_hold', raw: `From: postmaster@quarantine-ops.example
Subject: Your message is pending approval

The message you sent to admin@kestrel.example requires moderator approval before delivery. You will be notified if it is rejected.` },

  // ---------- interested ----------
  { id: 'd31', provider: 'google', label: 'interested', raw: `From: Rhea Kapur <rhea@flintstack.example>
Subject: Re: Flintstack outbound

Yes, this sounds useful. Can we do a call next Tuesday?` },
  { id: 'd32', provider: 'microsoft', label: 'interested', raw: `From: Joel Fernandes <joel@marigold.example>
Subject: RE: Marigold outbound

Hi, I'm out of office till Wednesday but keen to learn more. Share a few times for Thursday?` },
  { id: 'd33', provider: 'gateway', label: 'interested', raw: `From: Tara Singh <tara@opalstone.example>
Subject: Re: Opalstone outbound

Interested. Send pricing and a short deck please.` },
  { id: 'd34', provider: 'google', label: 'interested', raw: `From: Liam Byrne <liam@crestview.example>
Subject: Re: Crestview outbound

Happy to take a look. Booked a slot on your calendar for Friday.

On Mon, Nov 9, 2026 at 10:00 AM Alex Rowe <alex@sender.example> wrote:
> Reply "unsubscribe" to stop hearing from me.` },
  { id: 'd35', provider: 'microsoft', label: 'interested', raw: `From: Aditi Bhat <aditi@goldcrest.example>
Subject: RE: Goldcrest outbound

Just got back from vacation. Yes, let's talk, does Monday 11am work?

From: Alex Rowe <alex@sender.example>
Sent: Tuesday, 3 November 2026 09:45
Subject: Goldcrest outbound
I'm out of office next week, so reply anytime.` },
  { id: 'd36', provider: 'google', label: 'interested', raw: `From: Sahil Arora <sahil@peakfund.example>
Subject: Re: Peakfund outbound

haan bhai, interested. kal call kar sakte hain?` },

  // ---------- referral ----------
  { id: 'd37', provider: 'microsoft', label: 'referral', raw: `From: Mark Ellis <mark@silverline.example>
Subject: RE: Silverline outbound

I'm not the right person. Please reach out to our VP Sales, Dana (dana@silverline.example).` },
  { id: 'd38', provider: 'google', label: 'referral', raw: `From: Ayesha Khan <ayesha@corewell.example>
Subject: Re: Corewell outbound

Adding Rahul from our revenue team, he handles vendor evaluations.` },
  { id: 'd39', provider: 'gateway', label: 'referral', raw: `From: Ken Ito <ken@hikari.example>
Subject: Re: Hikari outbound

Wrong person, but forwarding to our sales lead who might care.` },

  // ---------- not_now ----------
  { id: 'd40', provider: 'google', label: 'not_now', raw: `From: Maya Das <maya@tealbrook.example>
Subject: Re: Tealbrook outbound

Bad timing, we're mid reorg. Check back in a couple of months.` },
  { id: 'd41', provider: 'microsoft', label: 'not_now', raw: `From: Victor Hugo <victor@orbitra.example>
Subject: RE: Orbitra outbound

Not right now. Follow up in January please.` },
  { id: 'd42', provider: 'gateway', label: 'not_now', raw: `From: Leena Roy <leena@duneworks.example>
Subject: Re: Duneworks outbound

Maybe later in the year, we just renewed our current contract.` },

  // ---------- not_interested ----------
  { id: 'd43', provider: 'google', label: 'not_interested', raw: `From: Sam Wu <sam@pixelmint.example>
Subject: Re: Pixelmint outbound

Not interested, thanks.` },
  { id: 'd44', provider: 'microsoft', label: 'not_interested', raw: `From: Rachel Green <rachel@thornbury.example>
Subject: RE: Thornbury outbound

We already use a tool for this and are happy with it.` },
  { id: 'd45', provider: 'gateway', label: 'not_interested', raw: `From: Igor Petrov <igor@baltica.example>
Subject: Re: Baltica outbound

This isn't relevant for us. No need to follow up.` },

  // ---------- unsubscribe ----------
  { id: 'd46', provider: 'google', label: 'unsubscribe', raw: `From: Nate Fox <nate@skyward.example>
Subject: Re: Skyward outbound

Remove me from your list.` },
  { id: 'd47', provider: 'microsoft', label: 'unsubscribe', raw: `From: Olivia Park <olivia@mapleleaf.example>
Subject: RE: Maplelaf outbound

STOP` },
  { id: 'd48', provider: 'gateway', label: 'unsubscribe', raw: `From: Henry Wood <henry@ashworth.example>
Subject: Re: Ashworth outbound

Please stop emailing me and unsubscribe this address.` },
  { id: 'd49', provider: 'google', label: 'unsubscribe', raw: `From: Ritu Jain <ritu@lotusbay.example>
Subject: Re: Lotusbay outbound

don't contact me again` },

  // ---------- other ----------
  { id: 'd50', provider: 'google', label: 'other', raw: `From: Yusuf Ali <yusuf@desertrose.example>
Subject: Re: Desert Rose outbound

Who are your current customers in logistics?` },
  { id: 'd51', provider: 'microsoft', label: 'other', raw: `From: Clara Moss <clara@fenwick.example>
Subject: RE: Fenwick outbound

Is this an automated email?` },
  { id: 'd52', provider: 'gateway', label: 'other', raw: `From: Arjun Pillai <arjun@tidalwave.example>
Subject: Re: Tidalwave outbound

What exactly does your product do?` },

  // ---------- extra hard cases ----------
  { id: 'd53', provider: 'microsoft', label: 'not_interested', raw: `From: Brian Shaw <brian@kingsley.example>
Subject: RE: Kingsley outbound

Not for us.

From: Alex Rowe <alex@sender.example>
Sent: Wednesday, 4 November 2026 14:10
Subject: Kingsley outbound
If you're out of office I'll follow up later. Reply unsubscribe to opt out.` },
  { id: 'd54', provider: 'google', label: 'out_of_office', raw: `From: Ella Reyes <ella@sundial.example>
Subject: Re: Sundial outbound
Auto-Submitted: auto-replied

Hi! I'm out sick today and will reply tomorrow.` },
  { id: 'd55', provider: 'gateway', label: 'auto_ack', raw: `From: Press Office <press@ventana.example>
Subject: Re: Ventana outbound
Auto-Submitted: auto-replied

This is an automated reply. Thank you for contacting the Ventana press office. We read every message but cannot respond to all.` },
  { id: 'd56', provider: 'microsoft', label: 'left_company', raw: `From: Hugo Lambert <hugo@quaystone.example>
Subject: Automatic reply: Quaystone outbound
Auto-Submitted: auto-replied

I am no longer at Quaystone. For partnership requests please write to partners@quaystone.example.` },
  { id: 'd57', provider: 'google', label: 'interested', raw: `From: Megha Iyer <megha@saffron.example>
Subject: Re: Saffron outbound

I'll be on leave next week, but let's speak this Friday if you're free.` },
  { id: 'd58', provider: 'microsoft', label: 'not_now', raw: `From: Tobias Klein <tobias@eisberg.example>
Subject: RE: Eisberg outbound

Saw this on my phone. I am out of office for the next two weeks, please follow up in December and we can discuss then.` },
];
