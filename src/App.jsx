import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";

import Home from "./pages/Home.jsx";
import Documents from "./pages/Documents.jsx";
import DocumentReader from "./pages/DocumentReader.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import History from "./pages/History.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ChatBot from "./components/ChatBot.jsx";
import { defaultDocuments, defaultUsers } from "./data/defaultData.js";
import { loadData, saveData } from "./utils/storage.js";
import { api } from "./services/api.js";

export default function App() {
  const [users, setUsers] = useState(() => loadData("users", defaultUsers));

  const [documents, setDocuments] = useState(() =>
    loadData("documents", defaultDocuments)
  );

  const [currentUser, setCurrentUser] = useState(() =>
    loadData("currentUser", null)
  );

  const [activity, setActivity] = useState(() =>
    loadData("activity", {
      reads: [],
      favorites: [],
      comments: [],
      ratings: [],
    })
  );

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  async function loadFromSql() {
    try {
      const [usersData, documentsData, activityData, reportsData] = await Promise.all([
        api.getUsers(),
        api.getDocuments(),
        api.getActivity(),
        api.getReports(),
      ]);

      setUsers(usersData);
      setDocuments(documentsData);
      setActivity(activityData);
      setReports(reportsData);

      saveData("users", usersData);
      saveData("documents", documentsData);
      saveData("activity", activityData);
    } catch (error) {
      alert("Không tải được dữ liệu SQL: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFromSql();
  }, []);

  function saveUsers(nextUsers) {
    setUsers(nextUsers);
    saveData("users", nextUsers);
  }

  function saveDocuments(nextDocuments) {
    setDocuments(nextDocuments);
    saveData("documents", nextDocuments);
  }

  function saveActivity(nextActivity) {
    setActivity(nextActivity);
    saveData("activity", nextActivity);
  }

  function updateProfile(updatedUser) {
    const nextUsers = users.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );

    saveUsers(nextUsers);

    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      saveData("currentUser", updatedUser);
    }
  }

  async function login(email, password) {
    try {
      const user = await api.login(email, password);

      setCurrentUser(user);
      saveData("currentUser", user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  }

  async function register(newUser) {
    try {
      await api.register(newUser);
      await loadFromSql();

      alert("Đăng ký thành công, tài khoản đã lưu vào SQL.");
    } catch (error) {
      alert("Đăng ký thất bại: " + error.message);
    }
  }

  async function addDocument(doc) {
    try {
      await api.addDocument(doc);
      await loadFromSql();

      alert("Đã gửi tài liệu lên SQL, chờ admin duyệt.");
    } catch (error) {
      alert("Upload thất bại: " + error.message);
    }
  }

  async function approveDocument(id) {
    try {
      await api.approveDocument(id);
      await loadFromSql();
    } catch (error) {
      alert("Lỗi duyệt tài liệu: " + error.message);
    }
  }

  async function rejectDocument(id) {
    const reason = window.prompt(
      "Nhập lý do từ chối tài liệu:\n\nVí dụ: File không mở được, sai môn học, nội dung không đúng mô tả, tài liệu bị trùng..."
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Bạn phải nhập lý do từ chối.");
      return;
    }

    try {
      await api.rejectDocumentWithReason(id, {
        reason,
        adminEmail: currentUser?.email,
        adminName: currentUser?.fullName,
      });

      await loadFromSql();

      alert("Đã từ chối tài liệu và gửi lý do về người dùng.");
    } catch (error) {
      alert("Lỗi từ chối tài liệu: " + error.message);
    }
  }

  async function deleteDocument(id) {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa bài đăng này không?"
    );

    if (!confirmDelete) return;

    try {
      await api.deleteDocument(id);
      await loadFromSql();
    } catch (error) {
      alert("Lỗi xóa tài liệu: " + error.message);
    }
  }

  async function toggleUserStatus(id) {
    try {
      await api.toggleUserStatus(id);
      await loadFromSql();
    } catch (error) {
      alert("Lỗi khóa/mở tài khoản: " + error.message);
    }
  }

  async function markAsRead(doc) {
    if (!currentUser || !doc?.id) return;

    try {
      await api.markAsRead(doc.id, {
        userEmail: currentUser.email,
        userName: currentUser.fullName,
        docTitle: doc.title,
      });

      await loadFromSql();
    } catch (error) {
      console.log("Lỗi lưu lịch sử đọc:", error.message);
    }
  }

  async function addComment(doc, content) {
    if (!currentUser) return;

    try {
      await api.addComment(doc, currentUser, content);
      await loadFromSql();
    } catch (error) {
      alert("Lỗi bình luận: " + error.message);
    }
  }

  async function deleteComment(commentId) {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa bình luận này không?"
    );

    if (!confirmDelete) return;

    try {
      await api.deleteComment(commentId);
      await loadFromSql();
    } catch (error) {
      alert("Lỗi xóa bình luận: " + error.message);
    }
  }

  async function resolveReport(reportId, status = "RESOLVED") {
    const adminNote = window.prompt(
      status === "IGNORED"
        ? "Nhập ghi chú bỏ qua báo cáo:"
        : "Nhập ghi chú xử lý báo cáo:"
    );

    if (adminNote === null) return;

    try {
      await api.resolveReport(reportId, {
        status,
        adminNote,
      });

      await loadFromSql();

      alert("Đã cập nhật trạng thái báo cáo.");
    } catch (error) {
      alert("Lỗi xử lý báo cáo: " + error.message);
    }
  }

  function toggleFavorite(doc) {
    if (!currentUser) return;

    const existed = activity.favorites.some(
      (item) => item.userEmail === currentUser.email && item.docId === doc.id
    );

    let nextFavorites;

    if (existed) {
      nextFavorites = activity.favorites.filter(
        (item) =>
          !(item.userEmail === currentUser.email && item.docId === doc.id)
      );
    } else {
      nextFavorites = [
        {
          id: Date.now(),
          userEmail: currentUser.email,
          userName: currentUser.fullName,
          docId: doc.id,
          docTitle: doc.title,
          createdAt: new Date().toISOString(),
        },
        ...activity.favorites,
      ];
    }

    const nextDocuments = documents.map((item) => {
      if (item.id !== doc.id) return item;

      return {
        ...item,
        favoriteCount: existed
          ? Math.max((item.favoriteCount || 0) - 1, 0)
          : (item.favoriteCount || 0) + 1,
      };
    });

    saveDocuments(nextDocuments);

    saveActivity({
      ...activity,
      favorites: nextFavorites,
    });
  }

  function rateDocument(doc, value) {
    if (!currentUser) return;

    const existed = activity.ratings.find(
      (item) => item.userEmail === currentUser.email && item.docId === doc.id
    );

    let nextRatings;

    if (existed) {
      nextRatings = activity.ratings.map((item) =>
        item.id === existed.id
          ? {
            ...item,
            value,
            createdAt: new Date().toISOString(),
          }
          : item
      );
    } else {
      nextRatings = [
        {
          id: Date.now(),
          userEmail: currentUser.email,
          userName: currentUser.fullName,
          docId: doc.id,
          docTitle: doc.title,
          value,
          createdAt: new Date().toISOString(),
        },
        ...activity.ratings,
      ];
    }

    const ratingsOfDoc = nextRatings.filter((item) => item.docId === doc.id);

    const average =
      ratingsOfDoc.length > 0
        ? ratingsOfDoc.reduce((total, item) => total + item.value, 0) /
        ratingsOfDoc.length
        : 0;

    const nextDocuments = documents.map((item) =>
      item.id === doc.id
        ? {
          ...item,
          rating: Number(average.toFixed(1)),
        }
        : item
    );

    saveDocuments(nextDocuments);

    saveActivity({
      ...activity,
      ratings: nextRatings,
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
          <p>Đang tải dữ liệu từ SQL Server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar currentUser={currentUser} logout={logout} />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              documents={documents}
              currentUser={currentUser}
              activity={activity}
              onRead={markAsRead}
              onToggleFavorite={toggleFavorite}
              onComment={addComment}
              onRate={rateDocument}
            />
          }
        />

        <Route
          path="/documents"
          element={
            <Documents
              documents={documents}
              currentUser={currentUser}
              activity={activity}
              onRead={markAsRead}
              onToggleFavorite={toggleFavorite}
              onComment={addComment}
              onRate={rateDocument}
            />
          }
        />

        <Route
          path="/documents/:id/read"
          element={
            <DocumentReader
              documents={documents}
              currentUser={currentUser}
              activity={activity}
              onRead={markAsRead}
              onComment={addComment}
              onDeleteComment={deleteComment}
            />
          }
        />

        <Route
          path="/upload"
          element={
            <UploadPage currentUser={currentUser} addDocument={addDocument} />
          }
        />

        <Route path="/login" element={<Login login={login} />} />
        <Route
          path="/register"
          element={<Register users={users} register={register} />}
        />

        <Route
          path="/profile"
          element={
            <Profile
              currentUser={currentUser}
              documents={documents}
              activity={activity}
              updateProfile={updateProfile}
            />
          }
        />

        <Route
          path="/history"
          element={
            <History
              currentUser={currentUser}
              documents={documents}
              activity={activity}
            />
          }
        />

        <Route
          path="/users/:email"
          element={<UserProfile users={users} documents={documents} />}
        />

        <Route
          path="/admin"
          element={
            <AdminDashboard
              currentUser={currentUser}
              users={users}
              documents={documents}
              activity={activity}
              approveDocument={approveDocument}
              rejectDocument={rejectDocument}
              toggleUserStatus={toggleUserStatus}
              deleteDocument={deleteDocument}
              deleteComment={deleteComment}
              reports={reports}
              resolveReport={resolveReport}
            />
          }
        />
      </Routes>
      <ChatBot currentUser={currentUser} />
    </div>
  );
}