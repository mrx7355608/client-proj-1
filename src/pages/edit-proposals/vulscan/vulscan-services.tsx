import React from "react";

const VulscanServices = () => (
  <div className=" proposal-page bg-white w-[8.5in] min-h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8">
    <h2 className="text-3xl font-bold text-gray-900 mb-10">Services</h2>

    {/* What We're Doing */}
    <div className="my-4">
      <h3 className="font-bold mb-4 text-xl bg-gray-100">What We're Doing</h3>
      <ul className="list-disc pl-6 space-y-3 text-sm marker:text-blue-500 large-bullets">
        <li className="leading-normal">
          <span className="font-bold">Monthly Automated Scans:</span> We will
          use VulScan by RapidFireTools to identify security weaknesses within
          your network and systems. Scans are scheduled for the 15th of every
          month.
        </li>
        <li className="leading-normal">
          <span className="font-bold">Comprehensive Reporting:</span> After each
          scan, you'll receive a clear, prioritized report detailing any
          discovered vulnerabilities and recommended remediation steps.
        </li>
        <li className="leading-normal">
          <span className="font-bold">Ongoing Support:</span> We'll review
          findings with you, offer guidance on patching and configuration
          changes, and schedule additional scans if needed.
          <br />
          <span className="block ml-0">
            Scan Coverage: We'll be covering internal
          </span>
        </li>
        <li className="leading-normal">
          <span className="font-bold">Internal Vulnerability Scanning:</span>{" "}
          This process will help identify potential security risks within your
          internal infrastructure (e.g., servers, workstations, and other
          networked devices). Any recommended changes or configuration
          adjustments arising from these scans that fall outside the initial
          scope of this agreement may require additional fees. If such changes
          become necessary, we will provide a written estimate for your review
          and approval before proceeding.
        </li>
      </ul>
    </div>

    {/* Why It Matters */}
    <div className="mb-4">
      <h3 className="font-bold mb-4 mt-9 text-xl bg-gray-100">
        Why It Matters
      </h3>
      <ul className="list-disc pl-6 space-y-3 text-sm marker:text-blue-500 large-bullets">
        <li className="leading-normal">
          <span className="font-bold">Enhanced Security:</span> Regular scans
          help detect and address potential entry points for cyber threats,
          reducing the risk of a successful attack.
        </li>
        <li className="leading-normal">
          <span className="font-bold">Regulatory Compliance:</span> Many
          industry regulations require or strongly recommend routine
          vulnerability assessments to maintain compliance.
        </li>
        <li className="leading-normal">
          <span className="font-bold">Proactive Risk Management:</span> By
          identifying and mitigating risks early, you minimize disruptions and
          avoid costly breaches or downtime.
        </li>
        <li className="leading-normal">
          <span className="font-bold">Peace of Mind:</span> Monthly scans ensure
          that you always have an up-to-date understanding of your security
          posture.
        </li>
      </ul>
    </div>

    {/* How It Helps You */}
    <div>
      <h3 className="font-bold mb-4 mt-9 text-xl bg-gray-100">
        How It Helps You
      </h3>
      <ul className="list-disc pl-6 space-y-3 text-sm marker:text-blue-500 large-bullets">
        <li className="leading-normal">
          <span className="font-bold">Protect Data & Reputation:</span>{" "}
          Vulnerability scanning helps safeguard sensitive data and maintains
          customer trust.
        </li>
        <li className="leading-normal">
          <span className="font-bold">Prioritize Resources:</span> Reports
          highlight the most critical issues first, enabling you to focus on the
          most impactful fixes.
        </li>
        <li className="leading-normal">
          <span className="font-bold">Visibility & Transparency:</span> Regular
          assessments provide ongoing insight into your IT environment's
          weaknesses, keeping you informed about your security status.
        </li>
      </ul>
    </div>
  </div>
);

export default VulscanServices;
