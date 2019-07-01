import CanaryExecutorStore from '../../stores/CanaryExecutorStore';
import { connect, ConnectedComponent } from '../connectedComponent';
import { observer } from 'mobx-react';
import { boundMethod } from 'autobind-decorator';
import * as React from 'react';
import { Form } from 'react-bootstrap';
import { MetadataSection } from '../canary-executor/MetadataSection';
import { ThresholdsSection } from '../canary-executor/ThresholdsSection';
import TestingTypeSection from '../canary-executor/TestingTypeSection';
import { ScopesSection } from '../canary-executor/ScopesSection';
import { CanaryScope } from '../../domain/kayenta';

interface Props {}

interface Stores {
  canaryExecutorStore: CanaryExecutorStore;
}

@connect('canaryExecutorStore')
@observer
export default class CanaryExecutorFormView extends ConnectedComponent<Props, Stores> {
  @boundMethod
  updateApplicationName(value: string): void {
    this.stores.canaryExecutorStore.updateApplicationName(value);
  }

  @boundMethod
  updateMetricsAccountName(value: string): void {
    this.stores.canaryExecutorStore.updateMetricsAccountName(value);
  }

  @boundMethod
  updateStorageAccountName(value: string): void {
    this.stores.canaryExecutorStore.updateStorageAccountName(value);
  }

  @boundMethod
  updateMarginalThreshold(value: number): void {
    this.stores.canaryExecutorStore.updateMarginalThreshold(value);
  }

  @boundMethod
  updatePassThreshold(value: number): void {
    this.stores.canaryExecutorStore.updatePassThreshold(value);
  }

  @boundMethod
  updateCanaryScope(newScope: CanaryScope, type: string): void {
    this.stores.canaryExecutorStore.updateCanaryScope(newScope, type);
  }

  @boundMethod
  updateTestingType(value: string): void {
    this.stores.canaryExecutorStore.updateTestingType(value);
  }

  @boundMethod
  touch(id: string): void {
    this.stores.canaryExecutorStore.touch(id);
  }

  @boundMethod
  markHasTheRunButtonBeenClickedFlagAsTrue(): void {
    this.stores.canaryExecutorStore.markHasTheRunButtonBeenClickedFlagAsTrue();
  }

  render(): React.ReactNode {
    const {
      canaryExecutionRequestObject,
      errors,
      touched,
      hasTheRunButtonBeenClicked
    } = this.stores.canaryExecutorStore;

    return (
      <div>
        <div id="canary-executor-form-view">
          <Form>
            <MetadataSection
              name={this.stores.canaryExecutorStore.applicationName}
              metricsAccountName={this.stores.canaryExecutorStore.metricsAccountName}
              storageAccountName={this.stores.canaryExecutorStore.storageAccountName}
              metricAccounts={this.stores.canaryExecutorStore.metricStoreAccounts}
              storageAccounts={this.stores.canaryExecutorStore.storageAccounts}
              updateApplicationName={this.updateApplicationName}
              updateMetricsAccountName={this.updateMetricsAccountName}
              updateStorageAccountName={this.updateStorageAccountName}
              touch={this.touch}
              errors={errors}
              touched={touched}
              hasTheRunButtonBeenClicked={hasTheRunButtonBeenClicked}
            />
            <ThresholdsSection
              marginalThreshold={canaryExecutionRequestObject.thresholds.marginal}
              passThreshold={canaryExecutionRequestObject.thresholds.pass}
              updateMarginalThreshold={this.updateMarginalThreshold}
              updatePassThreshold={this.updatePassThreshold}
              touch={this.touch}
              errors={errors}
              touched={touched}
              hasTheRunButtonBeenClicked={hasTheRunButtonBeenClicked}
            />
            <TestingTypeSection
              testingType={this.stores.canaryExecutorStore.testingType}
              updateTestingType={this.updateTestingType}
            />
            <ScopesSection
              controlScope={canaryExecutionRequestObject.scopes.default.controlScope}
              experimentScope={canaryExecutionRequestObject.scopes.default.experimentScope}
              updateCanaryScope={this.updateCanaryScope}
              testingType={this.stores.canaryExecutorStore.testingType}
              touch={this.touch}
              errors={errors}
              touched={touched}
              hasTheRunButtonBeenClicked={hasTheRunButtonBeenClicked}
            />
          </Form>
        </div>
      </div>
    );
  }
}
