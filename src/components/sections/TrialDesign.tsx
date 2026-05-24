export default function TrialDesign() {
  return (
    <section className="bg-white w-full">
      <div className="relative py-10 sm:py-14 lg:py-20 px-4 sm:px-8 lg:px-[93px] max-w-[1512px] mx-auto">
      <div className="bg-white rounded-[20px] sm:rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] p-6 sm:p-10 lg:p-16">
        <h2 className="text-2xl sm:text-4xl lg:text-[48px] font-bold text-[#0a4479] text-center tracking-[0.96px] mb-6 sm:mb-8 lg:mb-12">
          Trial Design
        </h2>

        <div className="text-base sm:text-xl lg:text-[30px] font-normal text-[#0a4479] leading-normal tracking-[0.6px] space-y-5 sm:space-y-6 lg:space-y-8 mb-10 sm:mb-14 lg:mb-20">
          <p>
            The Human Nutrition Unit carries out intervention trials investigating the relationships between diet and markers of health and disease.
          </p>
          <p>
            Trials are randomised, placebo-controlled, single or double blind interventions and may be of either a cross-over or parallel design.
          </p>
          <p>
            All trials are required to conform to human ethics procedures and good clinical practice (GCP), and human ethics committee approval is mandatory. Therapeutic trials are also required to obtain NZ Standing Committee on Therapeutic Trials (SCOTT) and MedSafe approval.
          </p>
        </div>

        {/* Residential Trials */}
        <div className="mb-10 sm:mb-14 lg:mb-20">
          <h3 className="text-xl sm:text-2xl lg:text-[36px] font-bold text-[#0a4479] text-center tracking-[0.72px] mb-4 sm:mb-6 lg:mb-8">
            Residential Trials
          </h3>
          <div className="text-base sm:text-xl lg:text-[30px] font-normal text-[#0a4479] leading-normal tracking-[0.6px] space-y-5 sm:space-y-6 lg:space-y-8">
            <p>
              <strong>Day stay (single day) studies</strong> carried out within the Human Nutrition Unit research clinic – these studies require volunteer participants to spend the day at the Unit where a range of tests are carried. Most studies are complete by 5pm when volunteers return home.
            </p>
            <p>
              <strong>Longer term (1-4 weeks) residential studies</strong> carried out within the Human Nutrition Unit residential facility – these studies require volunteer participants to live at the Unit and follow a carefully controlled dietary regime. Breakfast, dinner and overnight stay occur within the comfortable facilities of the Unit. During the day participants may attend work or study taking with them their food requirements for the day. Careful control and provision of all dietary components increases both the accuracy of the trial, since precise dietary components can be altered, and the compliance of the participants.
            </p>
            <p>
              Many of these studies are of a &apos;cross-over&apos; design, where the participant completes both the treatment and control arms of the trial. This gives additional power to the study to detect significant effects of the dietary component under investigation using only a small number of trial subjects.
            </p>
            <p>
              Entry into the trial is randomised and treatment group blinded until completion.
            </p>
          </div>
        </div>

        {/* Community Trials */}
        <div>
          <h3 className="text-xl sm:text-2xl lg:text-[36px] font-bold text-[#0a4479] text-center tracking-[0.72px] mb-4 sm:mb-6 lg:mb-8">
            Community Trials
          </h3>
          <div className="text-base sm:text-xl lg:text-[30px] font-normal text-[#0a4479] leading-normal tracking-[0.6px] space-y-5 sm:space-y-6 lg:space-y-8">
            <p>
              <strong>Long term (3-6 months) community studies</strong> which require visits to the Human Nutrition Unit research clinic for blood tests and other measurements – study participants continue their usual home life attending clinical visits to collect dietary test components and for study measurements. Long term studies allow the testing of products such as putative weight loss agents to be trialed.
            </p>
            <p>
              Many of these studies are of a &apos;parallel&apos; design, where participants are randomised into either the treatment or the control arm of the trial.
            </p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
