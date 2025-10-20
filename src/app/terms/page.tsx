import MarkdownPage from '../../components/MarkdownPage';

export const metadata = {
  title: 'Terms & Conditions | KRITIKA Beauty Salon',
  description: 'Read our terms and conditions to understand the rules and regulations for using our beauty salon services.',
};

export default function TermsPage() {
  return (
    <MarkdownPage
      title="Terms & Conditions"
      markdownFile="terms-and-conditions.md"
      lastUpdated="October 20, 2025"
    />
  );
}