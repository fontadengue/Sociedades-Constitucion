import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { pdfBase64, fileName, nombreSociedad } = req.body || {};

    if (!pdfBase64 || !nombreSociedad) {
      return res.status(400).json({ error: 'Faltan datos requeridos (pdfBase64, nombreSociedad)' });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const destinatario = process.env.EMAIL_TO;

    if (!gmailUser || !gmailAppPassword || !destinatario) {
      console.error('Faltan variables de entorno: GMAIL_USER, GMAIL_APP_PASSWORD o EMAIL_TO');
      return res.status(500).json({ error: 'Configuración del servidor incompleta' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword, // Contraseña de aplicación de Google (no la contraseña normal)
      },
    });

    await transporter.sendMail({
      from: `"Formulario Constitución de Sociedad" <${gmailUser}>`,
      to: destinatario,
      subject: `Informacion para crear Sociedad ${nombreSociedad}`,
      text: `Se adjunta el documento PDF con la información solicitada para dar de alta la nueva Sociedad ${nombreSociedad}.`,
      attachments: [
        {
          filename: fileName || 'formulario.pdf',
          content: pdfBase64,
          encoding: 'base64',
        },
      ],
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error interno en /api/send-email:', err);
    return res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
  }
}
