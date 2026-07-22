import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="tautin-footer">
      <div className="tautin-footer__inner">
        <div className="tautin-footer__grid">
          {/* A. Brand — sekitar 38% lebar */}
          <div className="tautin-footer__brand-col">
            <div className="tautin-footer__brand-name">TautIn</div>
            <p className="tautin-footer__brand-desc">
              TautIn menghubungkan proyek, kontribusi, dan evidence agar kolaborasi
              profesional dapat dinilai dengan lebih transparan dan dipercaya.
            </p>
            <div className="tautin-footer__value-chain">
              Project → Contribution → Evidence → Matching → Collaboration
            </div>
          </div>

          {/* B. Eksplorasi */}
          <div className="tautin-footer__nav-col">
            <h4 className="tautin-footer__col-title">Eksplorasi</h4>
            <ul className="tautin-footer__nav-list">
              <li><Link href="/discovery">Jelajahi proyek</Link></li>
              <li><Link href="/collaboration">Peluang kolaborasi</Link></li>
              <li><Link href="/organization/nusantara">Organisasi</Link></li>
              <li><span className="tautin-footer__disabled-link">Cara kerja TautIn</span></li>
            </ul>
          </div>

          {/* C. Bangun di TautIn */}
          <div className="tautin-footer__nav-col">
            <h4 className="tautin-footer__col-title">Bangun di TautIn</h4>
            <ul className="tautin-footer__nav-list">
              <li><Link href="/onboarding/project-source">Buat proyek</Link></li>
              <li><span className="tautin-footer__disabled-link">Tambahkan kontribusi</span></li>
              <li><span className="tautin-footer__disabled-link">Unggah evidence</span></li>
              <li><Link href="/plans/organization">Paket & penggunaan</Link></li>
            </ul>
          </div>

          {/* D. Kepercayaan */}
          <div className="tautin-footer__nav-col">
            <h4 className="tautin-footer__col-title">Kepercayaan</h4>
            <ul className="tautin-footer__nav-list">
              <li><span className="tautin-footer__disabled-link">Cara matching bekerja</span></li>
              <li><span className="tautin-footer__disabled-link">Pedoman evidence</span></li>
              <li><Link href="/settings/privacy">Privasi</Link></li>
              <li><span className="tautin-footer__disabled-link">Ketentuan penggunaan</span></li>
            </ul>
          </div>
        </div>

        <hr className="tautin-footer__divider" />

        <div className="tautin-footer__bottom">
          <div className="tautin-footer__copyright">© 2026 TautIn</div>
          <div className="tautin-footer__tagline">Kolaborasi yang dibangun dari bukti, bukan sekadar klaim.</div>
        </div>
      </div>
    </footer>
  );
}
