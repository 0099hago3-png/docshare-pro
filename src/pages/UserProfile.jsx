import { useParams } from "react-router-dom";

import DocumentGrid from "../components/DocumentGrid.jsx";
import MessagePage from "../components/MessagePage.jsx";
import ProfileHeader from "../components/ProfileHeader.jsx";

export default function UserProfile({ users, documents }) {
  const { email } = useParams();

  const decodedEmail = decodeURIComponent(email);

  const user = users.find((item) => item.email === decodedEmail);

  if (!user) {
    return (
      <MessagePage
        title="Không tìm thấy hồ sơ"
        message="Tài khoản này không tồn tại hoặc đã bị xóa."
      />
    );
  }

  const userDocs = documents.filter((doc) => doc.uploadedBy === user.email);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <ProfileHeader user={user} documents={userDocs} />

      <section className="mt-10">
        <h3 className="mb-6 text-2xl font-bold">
          Tài liệu đã đăng bởi {user.fullName}
        </h3>

        <DocumentGrid documents={userDocs} />
      </section>
    </main>
  );
}