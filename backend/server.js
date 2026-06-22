const express = require("express");
const cors = require("cors");
const sql = require("mssql");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb" }));

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
  },
};

if (process.env.DB_INSTANCE) {
  dbConfig.options.instanceName = process.env.DB_INSTANCE;
}

if (process.env.DB_PORT) {
  dbConfig.port = Number(process.env.DB_PORT);
}

let poolPromise;

async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig);
  }

  return await poolPromise;
}

function isEmail(value) {
  return typeof value === "string" && value.includes("@");
}

function splitTags(tags) {
  if (!tags) return [];

  if (Array.isArray(tags)) return tags;

  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function detectDocumentKind(fileName, fileType, fallback) {
  const name = String(fileName || "").toLowerCase();
  const type = String(fileType || "").toLowerCase();
  const value = String(fallback || "").toLowerCase();

  if (
    type.includes("pdf") ||
    name.endsWith(".pdf") ||
    value.includes("pdf")
  ) {
    return "PDF";
  }

  if (
    type.includes("word") ||
    type.includes("wordprocessingml") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    value.includes("word")
  ) {
    return "WORD";
  }

  if (
    type.includes("presentation") ||
    type.includes("powerpoint") ||
    name.endsWith(".ppt") ||
    name.endsWith(".pptx") ||
    value.includes("ppt") ||
    value.includes("powerpoint")
  ) {
    return "PPT";
  }

  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx") ||
    value.includes("excel")
  ) {
    return "EXCEL";
  }

  if (
    type.includes("image") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp")
  ) {
    return "IMAGE";
  }

  if (
    type.includes("text") ||
    name.endsWith(".txt")
  ) {
    return "TEXT";
  }

  if (
    name.startsWith("http") ||
    value.includes("link") ||
    value.includes("url")
  ) {
    return "LINK";
  }

  return "OTHER";
}

function mapDocument(doc) {
  return {
    ...doc,
    coverUrl: doc.coverUrl || doc.cover_url,
    fileName: doc.fileName || doc.file_name,
    fileUrl: doc.fileUrl || doc.file_url,
    fileType: doc.fileType || doc.file_type,
    fileSize: doc.fileSize || doc.file_size,
    favoriteCount: doc.favoriteCount ?? doc.favorite_count ?? 0,
    uploadedBy: doc.uploadedBy || doc.uploaded_by,
    uploadedByEmail: doc.uploadedByEmail || doc.uploaded_by_email,
    rejectReason: doc.rejectReason || doc.reject_reason,
    reviewedBy: doc.reviewedBy || doc.reviewed_by,
    reviewedAt: doc.reviewedAt || doc.reviewed_at,
    documentKind: doc.documentKind || doc.document_kind,
    isCompleted: doc.isCompleted ?? doc.is_completed,
    previewUrl: doc.previewUrl || doc.preview_url || doc.fileUrl || doc.file_url,
    createdAt: doc.createdAt || doc.created_at,
    tags: splitTags(doc.tags),
  };
}

async function createNotification(
  pool,
  userEmail,
  title,
  message,
  type = "SYSTEM"
) {
  if (!userEmail || !isEmail(userEmail)) return;

  await pool
    .request()
    .input("userEmail", sql.NVarChar, userEmail)
    .input("title", sql.NVarChar, title)
    .input("message", sql.NVarChar, message)
    .input("type", sql.NVarChar, type)
    .query(`
      INSERT INTO notifications (user_email, title, message, type)
      VALUES (@userEmail, @title, @message, @type)
    `);
}

async function saveInteraction(pool, data) {
  if (!data.userEmail) return;

  await pool
    .request()
    .input("userEmail", sql.NVarChar, data.userEmail)
    .input("docId", sql.Int, data.docId || null)
    .input("actionType", sql.NVarChar, data.actionType || "VIEW")
    .input("keyword", sql.NVarChar, data.keyword || null)
    .input("faculty", sql.NVarChar, data.faculty || null)
    .input("major", sql.NVarChar, data.major || null)
    .input("subject", sql.NVarChar, data.subject || null)
    .input("tags", sql.NVarChar, data.tags || null)
    .query(`
      INSERT INTO user_interactions
      (
        user_email, doc_id, action_type, keyword,
        faculty, major, subject, tags
      )
      VALUES
      (
        @userEmail, @docId, @actionType, @keyword,
        @faculty, @major, @subject, @tags
      )
    `);
}

app.get("/api/health", async (req, res) => {
  try {
    await getPool();

    res.json({
      message: "Backend kết nối SQL Server thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi kết nối SQL",
      error: error.message,
    });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        id,
        full_name AS fullName,
        email,
        password,
        role,
        enabled,
        avatar,
        cover_url AS coverUrl,
        bio,
        school,
        major_name AS majorName,
        created_at AS createdAt
      FROM users
      ORDER BY id DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy users",
      error: error.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, password)
      .query(`
        SELECT 
          id,
          full_name AS fullName,
          email,
          role,
          enabled,
          avatar,
          cover_url AS coverUrl,
          bio,
          school,
          major_name AS majorName
        FROM users
        WHERE email = @email AND password = @password
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({
        message: "Sai email hoặc mật khẩu",
      });
    }

    if (!user.enabled) {
      return res.status(403).json({
        message: "Tài khoản đã bị khóa",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi đăng nhập",
      error: error.message,
    });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu",
      });
    }

    const pool = await getPool();

    const existed = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT id FROM users WHERE email = @email
      `);

    if (existed.recordset.length > 0) {
      return res.status(409).json({
        message: "Email này đã được đăng ký",
      });
    }

    await pool
      .request()
      .input("fullName", sql.NVarChar, fullName)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, password)
      .query(`
        INSERT INTO users (full_name, email, password, role, enabled)
        VALUES (@fullName, @email, @password, 'USER', 1)
      `);

    res.json({
      message: "Đăng ký thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi đăng ký",
      error: error.message,
    });
  }
});

app.put("/api/users/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();

    await pool.request().input("id", sql.Int, id).query(`
      UPDATE users
      SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END
      WHERE id = @id
    `);

    res.json({
      message: "Đã cập nhật trạng thái tài khoản",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khóa/mở user",
      error: error.message,
    });
  }
});

app.get("/api/documents", async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        id,
        title,
        author,
        faculty,
        major,
        subject,
        year,
        isbn,
        type,
        status,
        description,
        cover_url AS coverUrl,
        file_name AS fileName,
        file_url AS fileUrl,
        file_type AS fileType,
        file_size AS fileSize,
        views,
        downloads,
        rating,
        favorite_count AS favoriteCount,
        tags,
        uploaded_by AS uploadedBy,
        uploaded_by_email AS uploadedByEmail,
        reject_reason AS rejectReason,
        reviewed_by AS reviewedBy,
        reviewed_at AS reviewedAt,
        document_kind AS documentKind,
        is_completed AS isCompleted,
        preview_url AS previewUrl,
        created_at AS createdAt
      FROM documents
      ORDER BY id DESC
    `);

    res.json(result.recordset.map(mapDocument));
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy tài liệu",
      error: error.message,
    });
  }
});

app.post("/api/documents", async (req, res) => {
  try {
    const doc = req.body;

    const pool = await getPool();

    const documentKind = detectDocumentKind(
  doc.fileName,
  doc.fileType,
  doc.documentKind || doc.fileKind
);

    await pool
      .request()
      .input("title", sql.NVarChar, doc.title)
      .input("author", sql.NVarChar, doc.author)
      .input("faculty", sql.NVarChar, doc.faculty)
      .input("major", sql.NVarChar, doc.major)
      .input("subject", sql.NVarChar, doc.subject)
      .input("year", sql.Int, Number(doc.year) || null)
      .input("isbn", sql.NVarChar, doc.isbn)
      .input("type", sql.NVarChar, doc.type || "BOOK")
      .input("status", sql.NVarChar, "PENDING")
      .input("description", sql.NVarChar, doc.description)
      .input("coverUrl", sql.NVarChar, doc.coverUrl)
      .input("fileName", sql.NVarChar, doc.fileName)
      .input("fileUrl", sql.NVarChar, doc.fileUrl)
      .input("fileType", sql.NVarChar, doc.fileType)
      .input("fileSize", sql.Int, doc.fileSize || 0)
      .input(
        "tags",
        sql.NVarChar,
        Array.isArray(doc.tags)
          ? doc.tags.join(",")
          : doc.tags || "new,upload"
      )
      .input("uploadedBy", sql.NVarChar, doc.uploadedBy)
      .input(
        "uploadedByEmail",
        sql.NVarChar,
        doc.uploadedByEmail || doc.userEmail || null
      )
      .input("documentKind", sql.NVarChar, documentKind)
      .input("previewUrl", sql.NVarChar, doc.previewUrl || doc.fileUrl || null)
      .query(`
        INSERT INTO documents
        (
          title, author, faculty, major, subject, year, isbn, type, status,
          description, cover_url, file_name, file_url, file_type, file_size,
          views, downloads, rating, favorite_count, tags, uploaded_by,
          uploaded_by_email, document_kind, is_completed, preview_url
        )
        VALUES
        (
          @title, @author, @faculty, @major, @subject, @year, @isbn, @type, @status,
          @description, @coverUrl, @fileName, @fileUrl, @fileType, @fileSize,
          0, 0, 0, 0, @tags, @uploadedBy,
          @uploadedByEmail, @documentKind, 1, @previewUrl
        )
      `);

    if (doc.uploadedByEmail || doc.userEmail) {
      await createNotification(
        pool,
        doc.uploadedByEmail || doc.userEmail,
        "Tài liệu đã được gửi lên hệ thống",
        `Tài liệu "${doc.title}" đã được gửi thành công và đang chờ quản trị viên duyệt.`,
        "UPLOAD"
      );
    }

    res.json({
      message: "Đã thêm tài liệu và chờ admin duyệt",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi thêm tài liệu",
      error: error.message,
    });
  }
});

app.put("/api/documents/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminEmail, adminName } = req.body || {};

    const pool = await getPool();

    const docResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT 
          title,
          uploaded_by AS uploadedBy,
          uploaded_by_email AS uploadedByEmail
        FROM documents 
        WHERE id = @id
      `);

    const doc = docResult.recordset[0];

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("reviewedBy", sql.NVarChar, adminName || adminEmail || "ADMIN")
      .query(`
        UPDATE documents 
        SET 
          status = 'APPROVED',
          reject_reason = NULL,
          reviewed_by = @reviewedBy,
          reviewed_at = GETDATE()
        WHERE id = @id
      `);

    const notifyEmail =
      doc?.uploadedByEmail || (isEmail(doc?.uploadedBy) ? doc.uploadedBy : null);

    await createNotification(
      pool,
      notifyEmail,
      "Tài liệu đã được duyệt",
      `Tài liệu "${doc?.title || "của bạn"}" đã được quản trị viên duyệt và hiển thị công khai.`,
      "APPROVED"
    );

    res.json({
      message: "Đã duyệt tài liệu và gửi thông báo",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi duyệt tài liệu",
      error: error.message,
    });
  }
});

app.put("/api/documents/:id/reject-with-reason", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, adminEmail, adminName } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Vui lòng nhập lý do từ chối tài liệu",
      });
    }

    const pool = await getPool();

    const docResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT 
          title,
          uploaded_by AS uploadedBy,
          uploaded_by_email AS uploadedByEmail
        FROM documents 
        WHERE id = @id
      `);

    const doc = docResult.recordset[0];

    if (!doc) {
      return res.status(404).json({
        message: "Không tìm thấy tài liệu",
      });
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("reason", sql.NVarChar, reason)
      .input("reviewedBy", sql.NVarChar, adminName || adminEmail || "ADMIN")
      .query(`
        UPDATE documents 
        SET 
          status = 'REJECTED',
          reject_reason = @reason,
          reviewed_by = @reviewedBy,
          reviewed_at = GETDATE()
        WHERE id = @id
      `);

    const notifyEmail =
      doc.uploadedByEmail || (isEmail(doc.uploadedBy) ? doc.uploadedBy : null);

    await createNotification(
      pool,
      notifyEmail,
      "Tài liệu bị từ chối",
      `Tài liệu "${doc.title}" đã bị từ chối. Lý do: ${reason}`,
      "REJECTED"
    );

    res.json({
      message: "Đã từ chối tài liệu, lưu lý do và gửi thông báo cho người dùng",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi từ chối tài liệu",
      error: error.message,
    });
  }
});

app.put("/api/documents/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();

    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        UPDATE documents 
        SET 
          status = 'REJECTED',
          reject_reason = N'Tài liệu chưa đáp ứng yêu cầu kiểm duyệt.',
          reviewed_at = GETDATE()
        WHERE id = @id
      `);

    res.json({
      message: "Đã từ chối tài liệu",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi từ chối tài liệu",
      error: error.message,
    });
  }
});

app.delete("/api/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();

    await pool.request().input("id", sql.Int, id).query(`
      DELETE FROM documents WHERE id = @id
    `);

    res.json({
      message: "Đã xóa tài liệu",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi xóa tài liệu",
      error: error.message,
    });
  }
});

app.post("/api/documents/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, userName, docTitle } = req.body;

    const pool = await getPool();

    await pool.request().input("id", sql.Int, id).query(`
      UPDATE documents SET views = views + 1 WHERE id = @id
    `);

    await pool
      .request()
      .input("userEmail", sql.NVarChar, userEmail)
      .input("userName", sql.NVarChar, userName)
      .input("docId", sql.Int, id)
      .input("docTitle", sql.NVarChar, docTitle)
      .query(`
        INSERT INTO read_history (user_email, user_name, doc_id, doc_title)
        VALUES (@userEmail, @userName, @docId, @docTitle)
      `);

    const docResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT faculty, major, subject, tags
        FROM documents
        WHERE id = @id
      `);

    const doc = docResult.recordset[0];

    if (doc && userEmail) {
      await saveInteraction(pool, {
        userEmail,
        docId: Number(id),
        actionType: "READ",
        faculty: doc.faculty,
        major: doc.major,
        subject: doc.subject,
        tags: doc.tags,
      });
    }

    res.json({
      message: "Đã lưu lịch sử đọc",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lưu lịch sử đọc",
      error: error.message,
    });
  }
});

app.get("/api/activity", async (req, res) => {
  try {
    const pool = await getPool();

    const reads = await pool.request().query(`
      SELECT 
        id,
        user_email AS userEmail,
        user_name AS userName,
        doc_id AS docId,
        doc_title AS docTitle,
        created_at AS createdAt
      FROM read_history
      ORDER BY id DESC
    `);

    const favorites = await pool.request().query(`
      SELECT 
        id,
        user_email AS userEmail,
        user_name AS userName,
        doc_id AS docId,
        doc_title AS docTitle,
        created_at AS createdAt
      FROM favorites
      ORDER BY id DESC
    `);

    const comments = await pool.request().query(`
      SELECT 
        id,
        user_email AS userEmail,
        user_name AS userName,
        doc_id AS docId,
        doc_title AS docTitle,
        content,
        created_at AS createdAt
      FROM comments
      ORDER BY id DESC
    `);

    const ratings = await pool.request().query(`
      SELECT 
        id,
        user_email AS userEmail,
        user_name AS userName,
        doc_id AS docId,
        doc_title AS docTitle,
        value,
        created_at AS createdAt
      FROM ratings
      ORDER BY id DESC
    `);

    res.json({
      reads: reads.recordset,
      favorites: favorites.recordset,
      comments: comments.recordset,
      ratings: ratings.recordset,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy activity",
      error: error.message,
    });
  }
});

app.post("/api/comments", async (req, res) => {
  try {
    const { userEmail, userName, docId, docTitle, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Vui lòng nhập nội dung bình luận",
      });
    }

    const pool = await getPool();

    await pool
      .request()
      .input("userEmail", sql.NVarChar, userEmail)
      .input("userName", sql.NVarChar, userName)
      .input("docId", sql.Int, docId)
      .input("docTitle", sql.NVarChar, docTitle)
      .input("content", sql.NVarChar, content)
      .query(`
        INSERT INTO comments (user_email, user_name, doc_id, doc_title, content)
        VALUES (@userEmail, @userName, @docId, @docTitle, @content)
      `);

    const docResult = await pool
      .request()
      .input("docId", sql.Int, docId)
      .query(`
        SELECT 
          faculty,
          major,
          subject,
          tags,
          uploaded_by_email AS uploadedByEmail
        FROM documents
        WHERE id = @docId
      `);

    const doc = docResult.recordset[0];

    if (doc && userEmail) {
      await saveInteraction(pool, {
        userEmail,
        docId,
        actionType: "COMMENT",
        faculty: doc.faculty,
        major: doc.major,
        subject: doc.subject,
        tags: doc.tags,
      });

      await createNotification(
        pool,
        doc.uploadedByEmail,
        "Có bình luận mới",
        `${userName || userEmail} đã bình luận vào tài liệu "${docTitle}".`,
        "COMMENT"
      );
    }

    res.json({
      message: "Đã bình luận",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi bình luận",
      error: error.message,
    });
  }
});

app.delete("/api/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();

    await pool.request().input("id", sql.Int, id).query(`
      DELETE FROM comments WHERE id = @id
    `);

    res.json({
      message: "Đã xóa bình luận",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi xóa bình luận",
      error: error.message,
    });
  }
});

app.post("/api/documents/:id/favorite", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, userName, docTitle } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        message: "Thiếu email người dùng",
      });
    }

    const pool = await getPool();

    const existed = await pool
      .request()
      .input("userEmail", sql.NVarChar, userEmail)
      .input("docId", sql.Int, id)
      .query(`
        SELECT id
        FROM favorites
        WHERE user_email = @userEmail AND doc_id = @docId
      `);

    const docResult = await pool
      .request()
      .input("docId", sql.Int, id)
      .query(`
        SELECT 
          title,
          faculty,
          major,
          subject,
          tags,
          uploaded_by_email AS uploadedByEmail
        FROM documents
        WHERE id = @docId
      `);

    const doc = docResult.recordset[0];

    if (existed.recordset.length > 0) {
      await pool
        .request()
        .input("favoriteId", sql.Int, existed.recordset[0].id)
        .query(`
          DELETE FROM favorites WHERE id = @favoriteId
        `);

      await pool.request().input("docId", sql.Int, id).query(`
        UPDATE documents
        SET favorite_count = CASE 
          WHEN favorite_count > 0 THEN favorite_count - 1 
          ELSE 0 
        END
        WHERE id = @docId
      `);

      return res.json({
        message: "Đã bỏ yêu thích",
        liked: false,
      });
    }

    await pool
      .request()
      .input("userEmail", sql.NVarChar, userEmail)
      .input("userName", sql.NVarChar, userName)
      .input("docId", sql.Int, id)
      .input("docTitle", sql.NVarChar, docTitle || doc?.title)
      .query(`
        INSERT INTO favorites (user_email, user_name, doc_id, doc_title)
        VALUES (@userEmail, @userName, @docId, @docTitle)
      `);

    await pool.request().input("docId", sql.Int, id).query(`
      UPDATE documents
      SET favorite_count = favorite_count + 1
      WHERE id = @docId
    `);

    if (doc) {
      await saveInteraction(pool, {
        userEmail,
        docId: Number(id),
        actionType: "FAVORITE",
        faculty: doc.faculty,
        major: doc.major,
        subject: doc.subject,
        tags: doc.tags,
      });

      await createNotification(
        pool,
        doc.uploadedByEmail,
        "Tài liệu được yêu thích",
        `${userName || userEmail} đã thích tài liệu "${docTitle || doc.title}".`,
        "FAVORITE"
      );
    }

    res.json({
      message: "Đã thêm vào yêu thích",
      liked: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi yêu thích tài liệu",
      error: error.message,
    });
  }
});
app.post("/api/documents/:id/rate", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, userName, docTitle, value } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        message: "Thiếu email người dùng",
      });
    }

    const ratingValue = Number(value);

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        message: "Điểm đánh giá phải từ 1 đến 5",
      });
    }

    const pool = await getPool();

    const existed = await pool
      .request()
      .input("userEmail", sql.NVarChar, userEmail)
      .input("docId", sql.Int, id)
      .query(`
        SELECT id
        FROM ratings
        WHERE user_email = @userEmail AND doc_id = @docId
      `);

    if (existed.recordset.length > 0) {
      await pool
        .request()
        .input("ratingId", sql.Int, existed.recordset[0].id)
        .input("value", sql.Int, ratingValue)
        .query(`
          UPDATE ratings
          SET value = @value, created_at = GETDATE()
          WHERE id = @ratingId
        `);
    } else {
      await pool
        .request()
        .input("userEmail", sql.NVarChar, userEmail)
        .input("userName", sql.NVarChar, userName)
        .input("docId", sql.Int, id)
        .input("docTitle", sql.NVarChar, docTitle)
        .input("value", sql.Int, ratingValue)
        .query(`
          INSERT INTO ratings (user_email, user_name, doc_id, doc_title, value)
          VALUES (@userEmail, @userName, @docId, @docTitle, @value)
        `);
    }

    const avgResult = await pool
      .request()
      .input("docId", sql.Int, id)
      .query(`
        SELECT AVG(CAST(value AS FLOAT)) AS avgRating
        FROM ratings
        WHERE doc_id = @docId
      `);

    const avgRating = Number(avgResult.recordset[0].avgRating || 0).toFixed(1);

    await pool
      .request()
      .input("docId", sql.Int, id)
      .input("avgRating", sql.Float, Number(avgRating))
      .query(`
        UPDATE documents
        SET rating = @avgRating
        WHERE id = @docId
      `);

    const docResult = await pool
      .request()
      .input("docId", sql.Int, id)
      .query(`
        SELECT faculty, major, subject, tags
        FROM documents
        WHERE id = @docId
      `);

    const doc = docResult.recordset[0];

    if (doc) {
      await saveInteraction(pool, {
        userEmail,
        docId: Number(id),
        actionType: "RATE",
        faculty: doc.faculty,
        major: doc.major,
        subject: doc.subject,
        tags: doc.tags,
      });
    }

    res.json({
      message: "Đã đánh giá tài liệu",
      rating: Number(avgRating),
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi đánh giá tài liệu",
      error: error.message,
    });
  }
});

app.get("/api/notifications/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT 
          id,
          user_email AS userEmail,
          title,
          message,
          type,
          is_read AS isRead,
          created_at AS createdAt
        FROM notifications
        WHERE user_email = @email
        ORDER BY id DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy thông báo",
      error: error.message,
    });
  }
});

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();

    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        UPDATE notifications 
        SET is_read = 1 
        WHERE id = @id
      `);

    res.json({
      message: "Đã đánh dấu đã đọc",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật thông báo",
      error: error.message,
    });
  }
});

app.post("/api/interactions", async (req, res) => {
  try {
    const data = req.body;

    if (!data.userEmail) {
      return res.status(400).json({
        message: "Thiếu email người dùng",
      });
    }

    const pool = await getPool();

    await saveInteraction(pool, {
      userEmail: data.userEmail,
      docId: data.docId,
      actionType: data.actionType || "VIEW",
      keyword: data.keyword,
      faculty: data.faculty,
      major: data.major,
      subject: data.subject,
      tags: Array.isArray(data.tags) ? data.tags.join(",") : data.tags,
    });

    res.json({
      message: "Đã lưu hành vi người dùng",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lưu hành vi người dùng",
      error: error.message,
    });
  }
});

app.get("/api/recommendations/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const pool = await getPool();

    const interactions = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT TOP 100 *
        FROM user_interactions
        WHERE user_email = @email
        ORDER BY created_at DESC
      `);

    const documentsResult = await pool.request().query(`
      SELECT 
        id,
        title,
        author,
        faculty,
        major,
        subject,
        year,
        isbn,
        type,
        status,
        description,
        cover_url AS coverUrl,
        file_name AS fileName,
        file_url AS fileUrl,
        file_type AS fileType,
        file_size AS fileSize,
        views,
        downloads,
        rating,
        favorite_count AS favoriteCount,
        tags,
        uploaded_by AS uploadedBy,
        document_kind AS documentKind,
        created_at AS createdAt
      FROM documents
      WHERE status = 'APPROVED'
    `);

    const userHistory = interactions.recordset;
    const documents = documentsResult.recordset.map(mapDocument);

    const facultyCount = {};
    const subjectCount = {};
    const tagCount = {};

    userHistory.forEach((item) => {
      if (item.faculty) {
        facultyCount[item.faculty] = (facultyCount[item.faculty] || 0) + 1;
      }

      if (item.subject) {
        subjectCount[item.subject] = (subjectCount[item.subject] || 0) + 1;
      }

      splitTags(item.tags).forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const scored = documents.map((doc) => {
      let score = 0;

      score += (facultyCount[doc.faculty] || 0) * 25;
      score += (subjectCount[doc.subject] || 0) * 40;

      doc.tags.forEach((tag) => {
        score += (tagCount[tag] || 0) * 20;
      });

      score += Number(doc.rating || 0) * 10;
      score += Number(doc.favoriteCount || 0) * 2;
      score += Number(doc.views || 0) * 0.01;
      score += Number(doc.downloads || 0) * 0.02;

      const createdAt = new Date(doc.createdAt).getTime();
      const daysOld = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);

      if (daysOld <= 7) score += 15;
      else if (daysOld <= 30) score += 8;

      return {
        ...doc,
        recommendScore: Number(score.toFixed(2)),
      };
    });

    const recommended = scored
      .sort((a, b) => b.recommendScore - a.recommendScore)
      .slice(0, 12);

    res.json(recommended);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi gợi ý tài liệu",
      error: error.message,
    });
  }
});

app.post("/api/chatbot", async (req, res) => {
  try {
    const { userEmail, message } = req.body;

    const question = String(message || "").trim();

    if (!question) {
      return res.status(400).json({
        message: "Vui lòng nhập nội dung cần hỏi",
      });
    }

    const pool = await getPool();

    const lower = question.toLowerCase();

    let query = `
      SELECT TOP 5
        id,
        title,
        author,
        faculty,
        major,
        subject,
        year,
        type,
        status,
        description,
        cover_url AS coverUrl,
        file_url AS fileUrl,
        views,
        downloads,
        rating,
        favorite_count AS favoriteCount,
        tags,
        document_kind AS documentKind
      FROM documents
      WHERE status = 'APPROVED'
    `;

    let orderBy = " ORDER BY id DESC";

    if (
      lower.includes("phổ biến") ||
      lower.includes("xem nhiều") ||
      lower.includes("nhiều lượt xem")
    ) {
      orderBy = " ORDER BY views DESC";
    }

    if (
      lower.includes("đánh giá cao") ||
      lower.includes("rating") ||
      lower.includes("hay nhất")
    ) {
      orderBy = " ORDER BY rating DESC";
    }

    if (
      lower.includes("mới") ||
      lower.includes("vừa thêm") ||
      lower.includes("mới nhất")
    ) {
      orderBy = " ORDER BY id DESC";
    }

    const keyword = lower
      .replace("tìm", "")
      .replace("cho tôi", "")
      .replace("tài liệu", "")
      .replace("gợi ý", "")
      .trim();

    let result;

    if (
      keyword &&
      !lower.includes("phổ biến") &&
      !lower.includes("đánh giá cao") &&
      !lower.includes("mới nhất")
    ) {
      result = await pool
        .request()
        .input("keyword", sql.NVarChar, `%${keyword}%`)
        .query(`
          ${query}
          AND (
            LOWER(title) LIKE @keyword
            OR LOWER(author) LIKE @keyword
            OR LOWER(faculty) LIKE @keyword
            OR LOWER(major) LIKE @keyword
            OR LOWER(subject) LIKE @keyword
            OR LOWER(tags) LIKE @keyword
          )
          ORDER BY rating DESC, views DESC
        `);
    } else {
      result = await pool.request().query(`${query} ${orderBy}`);
    }

    const docs = result.recordset.map(mapDocument);

    let answer = "";

    if (lower.includes("cách upload") || lower.includes("đăng tài liệu")) {
      answer =
        "Để upload tài liệu, bạn đăng nhập tài khoản, vào mục Upload, nhập tiêu đề, tác giả, khoa, ngành, môn học, mô tả và chọn file tài liệu. Sau khi gửi, tài liệu sẽ chờ quản trị viên duyệt trước khi hiển thị công khai.";
    } else if (lower.includes("admin") || lower.includes("quản trị")) {
      answer =
        "Quản trị viên có quyền duyệt hoặc từ chối tài liệu, nhập lý do từ chối, khóa/mở tài khoản người dùng, xóa tài liệu vi phạm và xóa bình luận không phù hợp.";
    } else if (docs.length > 0) {
      answer = `Mình tìm thấy ${docs.length} tài liệu phù hợp. Bạn có thể tham khảo các tài liệu bên dưới.`;
    } else {
      answer =
        "Mình chưa tìm thấy tài liệu phù hợp với yêu cầu này. Bạn có thể thử nhập từ khóa khác như Java, SQL, Cơ sở dữ liệu, Đồ án hoặc Slide bài giảng.";
    }

    await pool
      .request()
      .input("userEmail", sql.NVarChar, userEmail || null)
      .input("question", sql.NVarChar, question)
      .input("answer", sql.NVarChar, answer)
      .query(`
        INSERT INTO chat_messages (user_email, question, answer)
        VALUES (@userEmail, @question, @answer)
      `);

    res.json({
      answer,
      documents: docs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi chatbot",
      error: error.message,
    });
  }
});

app.get("/api/home-sections", async (req, res) => {
  try {
    const { email } = req.query;

    const pool = await getPool();

    const popular = await pool.request().query(`
      SELECT TOP 8 *
      FROM documents
      WHERE status = 'APPROVED'
      ORDER BY views DESC
    `);

    const latest = await pool.request().query(`
      SELECT TOP 8 *
      FROM documents
      WHERE status = 'APPROVED'
      ORDER BY id DESC
    `);

    const topRated = await pool.request().query(`
      SELECT TOP 8 *
      FROM documents
      WHERE status = 'APPROVED'
      ORDER BY rating DESC
    `);

    const mostFavorite = await pool.request().query(`
      SELECT TOP 8 *
      FROM documents
      WHERE status = 'APPROVED'
      ORDER BY favorite_count DESC
    `);

    let recommended = [];

    if (email) {
      const recommendResponse = await pool
        .request()
        .input("email", sql.NVarChar, email)
        .query(`
          SELECT TOP 8 *
          FROM documents
          WHERE status = 'APPROVED'
          ORDER BY rating DESC, views DESC
        `);

      recommended = recommendResponse.recordset;
    }

    res.json({
      popular: popular.recordset.map(mapDocument),
      latest: latest.recordset.map(mapDocument),
      topRated: topRated.recordset.map(mapDocument),
      mostFavorite: mostFavorite.recordset.map(mapDocument),
      recommended: recommended.map(mapDocument),
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy dữ liệu trang chủ",
      error: error.message,
    });
  }
});

app.get("/api/documents/:id/preview", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT 
          id,
          title,
          file_name AS fileName,
          file_url AS fileUrl,
          file_type AS fileType,
          preview_url AS previewUrl,
          document_kind AS documentKind
        FROM documents
        WHERE id = @id
      `);

    const doc = result.recordset[0];

    if (!doc) {
      return res.status(404).json({
        message: "Không tìm thấy tài liệu",
      });
    }

    const fileName = String(doc.fileName || "").toLowerCase();
    const fileType = String(doc.fileType || "").toLowerCase();
    const documentKind = String(doc.documentKind || "").toLowerCase();

    let previewType = "unsupported";

    if (
      fileType.includes("pdf") ||
      fileName.endsWith(".pdf") ||
      documentKind === "pdf"
    ) {
      previewType = "pdf";
    } else if (
      fileType.includes("image") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      documentKind === "image"
    ) {
      previewType = "image";
    } else if (
      fileName.endsWith(".txt") ||
      fileType.includes("text") ||
      documentKind === "text"
    ) {
      previewType = "text";
    }

    res.json({
      ...doc,
      previewType,
      previewUrl: doc.previewUrl || doc.fileUrl,
      canPreview: previewType !== "unsupported",
      message:
        previewType === "unsupported"
          ? "Định dạng này chưa hỗ trợ đọc trước trực tiếp. Vui lòng tải xuống hoặc chuyển sang PDF."
          : "Có thể đọc trước tài liệu",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi đọc trước tài liệu",
      error: error.message,
    });
  }
});



function mapViolationReport(row) {
  return {
    id: row.id,
    docId: row.doc_id,
    docTitle: row.doc_title,
    reporterEmail: row.reporter_email,
    reporterName: row.reporter_name,
    reason: row.reason,
    detail: row.detail,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

app.post("/api/reports", async (req, res) => {
  try {
    const {
      docId,
      docTitle,
      reporterEmail,
      reporterName,
      reason,
      detail,
    } = req.body;

    const realDocId = Number(docId);

    if (!realDocId) {
      return res.status(400).json({
        message: "Thiếu ID tài liệu",
      });
    }

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        message: "Vui lòng chọn lý do báo cáo",
      });
    }

    const pool = await getPool();

    await pool
      .request()
      .input("docId", sql.Int, realDocId)
      .input("docTitle", sql.NVarChar, docTitle || "")
      .input("reporterEmail", sql.NVarChar, reporterEmail || "")
      .input("reporterName", sql.NVarChar, reporterName || "")
      .input("reason", sql.NVarChar, reason)
      .input("detail", sql.NVarChar, detail || "")
      .query(`
        INSERT INTO violation_reports
        (doc_id, doc_title, reporter_email, reporter_name, reason, detail, status)
        VALUES
        (@docId, @docTitle, @reporterEmail, @reporterName, @reason, @detail, 'PENDING')
      `);

      const admins = await pool.request().query(`
  SELECT email
  FROM users
  WHERE role = 'ADMIN' AND enabled = 1
`);

for (const admin of admins.recordset) {
  await createNotification(
    pool,
    admin.email,
    "Có báo cáo vi phạm mới",
    `${reporterName || reporterEmail || "Người dùng"} đã báo cáo tài liệu "${docTitle}". Lý do: ${reason}`,
    "REPORT"
  );
} 

    res.json({
      message: "Đã gửi báo cáo vi phạm. Admin sẽ kiểm tra tài liệu này.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi gửi báo cáo vi phạm",
      error: error.message,
    });
  }
});

app.get("/api/reports", async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT *
      FROM violation_reports
      ORDER BY 
        CASE WHEN status = 'PENDING' THEN 0 ELSE 1 END,
        created_at DESC
    `);

    res.json(result.recordset.map(mapViolationReport));
  } catch (error) {
    res.status(500).json({
      message: "Lỗi tải danh sách báo cáo",
      error: error.message,
    });
  }
});

app.put("/api/reports/:id/resolve", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, adminNote } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "ID báo cáo không hợp lệ",
      });
    }

    const finalStatus = status || "RESOLVED";

    const pool = await getPool();

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar, finalStatus)
      .input("adminNote", sql.NVarChar, adminNote || "")
      .query(`
        UPDATE violation_reports
        SET 
          status = @status,
          admin_note = @adminNote,
          resolved_at = GETDATE()
        WHERE id = @id
      `);

    res.json({
      message: "Đã cập nhật trạng thái báo cáo",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi xử lý báo cáo",
      error: error.message,
    });
  }
});
app.listen(process.env.PORT || 5000, () => {
  console.log(`Backend chạy tại http://localhost:${process.env.PORT || 5000}`);
}); 