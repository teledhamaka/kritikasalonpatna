import MarkdownPage from '../../components/MarkdownPage';

export const metadata = {
  title: 'Cancellation & Refund Policy | KRITIKA Beauty Salon',
  description: 'Learn about our cancellation and refund policy for appointments and services.',
};

export default function CancellationPage() {
  return (
    <MarkdownPage
      title="Cancellation & Refund Policy"
      markdownFile="cancellation-policy.md"
      lastUpdated="October 20, 2025"
    />
  );
}