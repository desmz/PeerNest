import { Section } from '@react-email/components';

function Header() {
  return <Section style={headerSection}>This is a header section</Section>;
}

export default Header;

const headerSection = {
  padding: '20px 0px',
  textAlign: 'center' as const,
};
