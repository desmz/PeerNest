import { Body, Container, Head, Html, Section } from '@react-email/components';

import type { TGenericLayoutProps } from '../../types';
import Footer from '../components/footer';
import Header from '../components/header';

type TBaseLayoutProps = TGenericLayoutProps & {};

function BaseLayout({ children, mainSectionStyle }: TBaseLayoutProps) {
  return (
    <Html lang='en'>
      <Head>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Head>

      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Header />

          {/* Main */}
          <Section style={{ ...mainSection, ...mainSectionStyle }}>
            {children}

            {/* <Divider /> */}

            {/* <ExtraInfo /> */}
          </Section>

          {/* Footer */}
          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

export default BaseLayout;

const childrenDefault = {
  color: 'red',
  fontSize: '24px',
  fontWeight: 1.5,
};

BaseLayout.PreviewProps = {
  children: <p style={childrenDefault}>Place children components here!!!</p>,
} as TBaseLayoutProps;

const main = {
  backgroundColor: '#F9F9F9',
  fontFamily: 'Poppins, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif !important',
  color: '#4f5660',
};

const container = {
  margin: '0 auto',
  maxWidth: '604px',
  padding: '20px 0px',
  textAlign: 'center' as const,
  overflow: 'hidden' as const,
};

// body
export const mainSection = {
  width: '100%',
  borderRadius: '2%',
  paddingTop: '40px',
  paddingBottom: '40px',
  paddingLeft: '50px',
  paddingRight: '50px',
  backgroundColor: 'white',
  textAlign: 'center' as const,
};
