import MarkdownPage from '../../components/MarkdownPage';

export const metadata = {
  title: 'Privacy Policy | KRITIKA Beauty Salon',
  description: 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <MarkdownPage
      title="Privacy Policy"
      markdownFile="privacy-policy.md"
      lastUpdated="October 20, 2025"
    />
  );
}