/**
 * Document Wrapper
 */

import Document, { DocumentContext } from 'next/document';
import { SheetsRegistry, JssProvider, createGenerateId } from 'react-jss';
import ThemeProvider from '../util/ThemeProvider';

class AppDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const registry = new SheetsRegistry();
    const generateId = createGenerateId();
    const originalRenderPage = ctx.renderPage;
    ctx.renderPage = () => originalRenderPage({
      // eslint-disable-next-line react/display-name
      enhanceApp: App => props => (
        <JssProvider registry={registry} generateId={generateId}>
          <App {...props} />
        </JssProvider>
      ),
    });
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      styles: [
        <>
          {initialProps.styles}
          <style id='server-side-styles'>{registry.toString()}</style>
        </>
      ],
    };
  }
}

export default AppDocument;
