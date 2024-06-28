import "src/styles/base.scss";

import "dayjs/locale/en";
import "dayjs/locale/et";

import { useEffect, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ConfigProvider } from "antd";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { DevTools } from "jotai-devtools";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import dayjs from "dayjs";
import first from "lodash/first";
import find from "lodash/find";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { localeAtom } from "src/atoms.tsx";
import { dynamicActivate } from "src/utils/lingui";

import { organizationIdAtom, organizationsAtom, setOrganizationsAtom } from "src/atoms";
import BaseLayout from "src/layouts/base";
import Clients from "src/routes/clients";
import Index from "src/routes/index";
import Invoices from "src/routes/invoices";
import InvoiceDetails from "src/routes/invoices/details.tsx";
import InvoicePreview from "src/routes/invoices/preview.tsx";
import SettingsInvoice from "src/routes/settings/invoice";
import SettingsOrganization from "src/routes/settings/organization";
import SettingsTaxRates from "src/routes/settings/tax-rates";
import TimeTracking from "src/routes/time-tracking";

// Components
import Loading from "src/components/loading";
import TaxRateForm from "src/components/tax-rates/form.tsx";

dayjs.extend(localizedFormat);

const App = () => {
  // Load locale
  const locale = useAtomValue(localeAtom);

  useEffect(() => {
    dynamicActivate(locale);
  }, [locale]);

  // Organizations
  const [organizationId, setOrganizationId] = useAtom(organizationIdAtom);
  const organizations = useAtomValue(organizationsAtom);
  const setOrganizations = useSetAtom(setOrganizationsAtom);

  useEffect(() => {
    setOrganizations();
  }, []);
  // Watch for organization changes
  useEffect(() => {
    if (!find(organizations, { id: organizationId })) {
      const nextOrganization: any = first(organizations);
      setOrganizationId(organizations.length > 0 ? nextOrganization.id : null);
    }
  }, [organizations]);

  return (
    <Suspense fallback={<Loading />}>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 2,
          },
        }}
      >
        <DevTools />
        <I18nProvider i18n={i18n}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/invoices" element={<BaseLayout />}>
                <Route index element={<Invoices />} />
                <Route path=":id" element={<InvoiceDetails />} />
                <Route path=":id/preview" element={<InvoicePreview />} />
                <Route path=":id/pdf" element={<InvoiceDetails />} />
              </Route>
              <Route path="/clients" element={<BaseLayout />}>
                <Route index element={<Clients />} />
              </Route>
              <Route path="/time-tracking" element={<BaseLayout />}>
                <Route path="" element={<TimeTracking />} />
              </Route>
              <Route path="/settings" element={<BaseLayout />}>
                <Route index element={<Navigate to="/invoices/organization" />} />
                <Route path="invoice" element={<SettingsInvoice />} />
                <Route path="organization" element={<SettingsOrganization />} />
                <Route path="tax-rates" element={<SettingsTaxRates />}>
                  <Route path="new" element={<TaxRateForm />} />
                  <Route path=":id" element={<TaxRateForm />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </I18nProvider>
      </ConfigProvider>
    </Suspense>
  );
};

export default App;
