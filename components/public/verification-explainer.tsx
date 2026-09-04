import type { PublicVerificationSummaryDto } from "@/features/properties/domain/contracts";
import { humanizePropertyValue } from "@/lib/formatting/property-values";

export function VerificationExplainer({
  verifications,
}: Readonly<{ verifications: readonly PublicVerificationSummaryDto[] }>) {
  return (
    <section className="detail-section" aria-labelledby="verification-heading">
      <p className="eyebrow">Scoped review</p>
      <h2 id="verification-heading">Understand what has—and has not—been reviewed</h2>
      {verifications.length === 0 ? (
        <div className="verification-education">
          <strong>No property-specific verification claim is published.</strong>
          <p>
            UrbanEdge may review selected records and property information for a defined purpose. A
            review is not a title guarantee, legal opinion, boundary certification, or promise of
            approval.
          </p>
        </div>
      ) : (
        <div className="verification-list">
          {verifications.map((verification) => (
            <details key={verification.code}>
              <summary>
                <span>{verification.label}</span>
                <small>What this means</small>
              </summary>
              {verification.explanation ? <p>{verification.explanation}</p> : null}
              <dl>
                <div>
                  <dt>Scope</dt>
                  <dd>{verification.scope}</dd>
                </div>
                <div>
                  <dt>Limitation</dt>
                  <dd>{verification.limitation}</dd>
                </div>
                {verification.checkDate ? (
                  <div>
                    <dt>Check date</dt>
                    <dd>{verification.checkDate}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Source class</dt>
                  <dd>{humanizePropertyValue(verification.sourceClass)}</dd>
                </div>
              </dl>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
