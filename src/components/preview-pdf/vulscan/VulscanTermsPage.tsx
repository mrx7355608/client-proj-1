import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const VulscanTermsPage = () => {
  return (
    <>
      <Page style={styles.page}>
        <Text style={styles.title}>Terms of Service</Text>

        <View style={styles.section}>
          <View style={styles.termBox}>
            <Text style={styles.termHeading}>1. Rates</Text>
            <Text style={styles.termText}>
              Services under this Agreement shall be provided to NSB Board of
              Realtors at the above rate for 36 months, including on-site
              support (as needed) at no charge during the normal business hours
              Monday through Friday from 8:00 a.m. to 6:00 pm per month. After
              hours, 2-hour notice, base rates of $78 per hour for work done
              outside the normal business hours Monday through Friday from 8:00
              a.m. to 6:00 p.m., After hours services are based on one-hour
              minimum charge for services with 15-minute increments after the
              initial first hour. These rates are for labor only and do not
              include parts and/or materials that may be required. This contract
              will automatically renew for an additional 12-month term unless
              either party provides written notice of termination at least 60
              days prior to the expiration of the current term.
            </Text>
          </View>

          <View style={styles.termBox}>
            <Text style={styles.termHeading}>
              2. Terms, Payment & Collection Costs
            </Text>
            <Text style={styles.termText}>
              ITX Solutions will invoice NSB Board of Realtors upon competition
              of any additional hours, Rapid Response, Help Desk or As Needed
              hours. Payment terms for any additional hours will be Net 10. Any
              payment not made within thirty days of the invoice date shall be
              subject to a late charge of one percent (1.5%) per month or the
              maximum rate allowed by law from the date of invoice, until paid.
            </Text>
          </View>

          <View style={styles.termBox}>
            <Text style={styles.termHeading}>3. Authorization</Text>
            <Text style={styles.termText}>
              NSB Board of Realtors acknowledges that the person signing this
              Agreement on its behalf is authorized to do so and may bind to all
              the terms and conditions contained herein and represents and
              warrants that such person is acting within the scope of his or her
              authority as an officer, director or duly authorized agent or
              employee of NSB Board of Realtors.
            </Text>
          </View>

          <View style={styles.termBox}>
            <Text style={styles.termHeading}>4. Notice</Text>
            <Text style={styles.termText}>
              All notices, requests and communications under this Agreement
              shall be in writing. Notice shall be deemed to have been given on
              the date of service if personally served or served by facsimile on
              the party to whom notice is to be given. If notice is mailed, it
              shall be deemed to be given within seventy-two (72) hours after
              mailing, if mailed to the party to whom notice is to be given, by
              first-class mail, registered or certified, postage prepaid, and
              addressed to the party at the address set out below, or any other
              address that any party may designate by written notice from time
              to time.
            </Text>
            <Text style={styles.termText}>
              ITX Solutions 121 S Orange Ave, Suite 1500, Orlando, FL 32801
            </Text>
          </View>
        </View>
      </Page>

      <Page style={styles.page}>
        <View style={styles.section}>
          <View style={styles.termBox}>
            <Text style={styles.termHeading}>
              5. Alterations to Services or Equipment
            </Text>
            <Text style={styles.termText}>
              If NSB Board of Realtors alters any Services or Equipment
              conducted by ITX Solutions without the express written consent of
              ITX Solutions, NSB Board of Realtors does so at its own risk and
              expense. ITX Solutions shall not be liable or responsible for
              problems created because of NSB Board of Realtors alteration of
              Services, Equipment and/or network system. If NSB Board of
              Realtors wishes ITX Solutions to correct or fix its alterations or
              problems relating thereto, such Services by ITX Solutions will be
              considered a new project and NSB Board of Realtors agrees that the
              same terms and conditions set out in this Agreement shall apply.
            </Text>
          </View>
          <View style={styles.termBox}>
            <Text style={styles.termHeading}>
              6. Reimbursement for Supplies
            </Text>
            <Text style={styles.termText}>
              On occasion, ITX Solutions may need to purchase spare parts, other
              equipment, supplies, accessories or software; in that case, NSB
              Board of Realtors shall be responsible to and agrees to reimburse
              ITX Solutions for all such costs or expenses incurred. No
              purchases will be made without prior approval.
            </Text>
          </View>

          <View style={styles.termBox}>
            <Text style={styles.termHeading}>
              7. Customer Warranty, Software Licensing
            </Text>
            <Text style={styles.termText}>
              NSB Board of Realtors warrants that all software it provides to
              ITX Solutions for installation, configuration or use in any way,
              has been legally obtained and is properly licensed. NSB Board of
              Realtors further warrants that it has legally purchased enough
              copies of such software and that it has not violated any licensing
              laws. ITX Solutions has no knowledge regarding licensing of
              software provided to it by NSB Board of Realtors and indemnifies
              ITX Solutions for any installation, configuration, or use of such
              software. NSB Board of Realtors understands and acknowledges that
              that it shall be solely responsible and liable for all licensing
              and purchasing of software.
            </Text>
          </View>

          <View style={styles.termBox}>
            <Text style={styles.termHeading}>8. Limitation of Liability</Text>
            <Text style={styles.termText}>
              ITX Solutions shall not be liable to NSB Board of Realtors for
              direct damages greater than the amount or price payable hereunder
              for its Services. Further, ITX Solutions shall not be liable to
              NSB Board of Realtors for any special, indirect, incidental,
              consequential, or punitive damages arising out of or relating to
              this Agreement, whether the claim alleges tortuous conduct
              (including negligence) or any other legal theory.
            </Text>
          </View>

          <View style={styles.termBox}>
            <Text style={styles.termHeading}>9. Relationship</Text>
            <Text style={styles.termText}>
              ITX Solutions provides services to NSB Board of Realtors hereunder
              as an independent contractor, and this Agreement shall not be
              construed as a partnership or joint venture.
            </Text>
          </View>
        </View>
      </Page>

      <Page style={styles.page}>
        <View style={styles.section}>
          <View style={styles.termBox}>
            <Text style={styles.termHeading}>
              10. Non-Solicitation of Employees
            </Text>
            <Text style={styles.termText}>
              NSB Board of Realtors acknowledges that ITX Solutions has a
              substantial investment in its employees that provide services to
              NSB Board of Realtors under this Agreement and that such employees
              are subject to ITX Solutions control and supervision. In
              consideration of this investment, NSB Board of Realtors agrees not
              to solicit, hire, employ, retain, or contract with any employee of
              the other, without first receiving ITX Solutions' written consent.
              If any employee terminates his or her employment with ITX
              Solutions (regardless of the reason for termination) and is
              employed by NSB Board of Realtors (or any affiliate or subsidiary)
              in any capacity either during or within a 6-month period, NSB
              Board of Realtors shall immediately pay ITX Solutions an amount
              equal to 50% of the then current yearly salary or wage paid by ITX
              Solutions to such employee.
            </Text>
          </View>
          <View style={styles.termBox}>
            <Text style={styles.termHeading}>11. Severability</Text>
            <Text style={styles.termText}>
              Any provision of this Agreement, which is invalid, illegal, or
              unenforceable in any jurisdiction shall, as to that jurisdiction,
              be ineffective to the extent of such invalidity, illegality or
              unenforceability without affecting in any way the remaining
              provisions hereof or, to the extent permitted by law, rendering
              that or any other provision invalid, illegal or unenforceable.
            </Text>
          </View>

          <View style={styles.termBox}>
            <Text style={styles.termHeading}>12. Entire Agreement</Text>
            <Text style={styles.termText}>
              This Agreement contains the entire agreement between the parties
              regarding the subject matter herein, and supersedes any prior
              agree- ments or representations, whether oral or written. No
              agreement, representation or understanding not specifically
              contained herein shall be binding, unless in writing and signed by
              ITX Solutions and NSB Board of Realtors agreed upon adjustments.
            </Text>
          </View>

          <View style={styles.termBox}>
            <Text style={styles.termHeading}>13. Attorney's Fees & Costs</Text>
            <Text style={styles.termText}>
              In any action involving the enforcement or interpretation of this
              Agreement, the prevailing party, whether NSB Board of Realtors or
              ITX Solutions, shall be entitled to its reasonable attorneys' fees
              and costs, including such fees and costs incurred in connection
              with any appeals, in addition to such other relief as may be
              provided by law.
            </Text>
          </View>

          <View style={styles.termBox}>
            <Text style={styles.termHeading}>
              14. Arbitration & Governing Law
            </Text>
            <Text style={styles.termText}>
              Any controversies arising out of or relating to this Agreement, or
              the interpretation, performance or breach thereof shall be settled
              by binding arbitration in Florida Judgment upon any award rendered
              by the arbitrator(s) may be entered and enforced in any court
              having jurisdiction. Florida law shall govern the construction,
              validity, and interpretation of this Agreement and the performance
              of its obligations.
            </Text>
          </View>
        </View>
      </Page>

      <Page style={styles.page}>
        <View style={styles.section}>
          <View style={styles.termBox}>
            <Text style={styles.termHeading}>
              15. Limitations and Exclusions
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletLabel}>Non-Exhaustive: </Text>
                  Vulnerability scans identify many known vulnerabilities, but
                  no solution can guarantee the detection of every possible
                  security gap.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletLabel}>Live Environments: </Text>
                  Active scans may temporarily impact network performance,
                  although VulScan is designed to minimize disruptions.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletLabel}>Remediation: </Text>
                  Implementation of remediation steps (e.g., patching or
                  reconfigurations) is ultimately the responsibility of the
                  client unless otherwise specified in an additional service
                  scope
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    width: 612, // 8.5 inches
    height: 792, // 11 inches
    alignSelf: "center",
    padding: 54,
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 48,
  },
  section: {
    gap: 18,
  },
  termBox: {
    marginBottom: 0,
  },
  termHeading: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  termText: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 10,
    marginTop: 8,
    lineHeight: 1.5,
  },
  bulletList: {
    marginTop: 12,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 12,
  },
  bulletText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 1.4,
  },
  bulletLabel: {
    fontWeight: "bold",
    color: "#111827",
  },
});

export default VulscanTermsPage;
