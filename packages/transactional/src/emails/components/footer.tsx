import { envObj } from '@peernest/config/dynamic';
import { Section, Text } from '@react-email/components';

function Footer() {
  return (
    <Section style={footerSection}>
      <Text style={footerText}>Sent by {envObj.BRAND_NAME}</Text>
    </Section>
  );
}

export default Footer;

const footerSection = {
  padding: '20px 0px 48px',
  textAlign: 'center' as const,
  color: '#99AAB5',
};

const footerText = {
  margin: '0px',
  fontSize: '12px',
};
