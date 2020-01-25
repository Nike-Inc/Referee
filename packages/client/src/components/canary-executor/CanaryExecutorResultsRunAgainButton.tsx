import { Button } from 'react-bootstrap';
import CanaryExecutorStore from '../../stores/CanaryExecutorStore';
import ConfigEditorStore from '../../stores/ConfigEditorStore';
import { RouterProps } from 'react-router';
import { connect, ConnectedComponent } from '../connectedComponent';
import { observer } from 'mobx-react';
import * as React from 'react';
import log from '../../util/LoggerFactory';
import { fetchCanaryResultsService, kayentaApiService } from '../../services';
import { boundMethod } from 'autobind-decorator';
import './CanaryExecutorResultsRunAgainButton.scss';
import { CanaryAdhocExecutionRequest } from '../../domain/Kayenta';
import ListStore from '../../stores/ListStore';
import { DisplayableError } from '../../domain/Referee';

interface Stores {
  canaryExecutorStore: CanaryExecutorStore;
  configEditorStore: ConfigEditorStore;
  errorStore: ListStore<DisplayableError>;
}

interface Props extends RouterProps {}

@connect('canaryExecutorStore', 'configEditorStore', 'errorStore')
@observer
export default class CanaryExecutorResultsRunAgainButton extends ConnectedComponent<Props, Stores> {
  @boundMethod
  private async handleRunButtonClick(): Promise<void> {
    this.stores.configEditorStore.markHasTheCopyOrSaveButtonBeenClickedFlagAsTrue();
    this.stores.canaryExecutorStore.markHasTheRunButtonBeenClickedFlagAsTrue();

    if (
      !this.stores.configEditorStore.isCanaryConfigValid ||
      !this.stores.canaryExecutorStore.isExecutionRequestValid
    ) {
      return;
    }

    const canaryAdhocExecutionRequest: CanaryAdhocExecutionRequest = {
      canaryConfig: this.stores.configEditorStore.canaryConfigObject,
      executionRequest: this.stores.canaryExecutorStore.canaryExecutionRequestObject
    };

    try {
      const data = await kayentaApiService.initiateCanaryWithConfig(
        canaryAdhocExecutionRequest,
        this.stores.canaryExecutorStore.applicationName,
        this.stores.canaryExecutorStore.metricsAccountName,
        this.stores.canaryExecutorStore.storageAccountName
      );
      this.stores.canaryExecutorStore.clearResultsRequestComplete();
      this.stores.canaryExecutorStore.resetIsAccordionExpanded();
      this.stores.canaryExecutorStore.setCanaryExecutionId(data.canaryExecutionId);
      this.props.history.push(
        '/dev-tools/canary-executor/results/' + this.stores.canaryExecutorStore.canaryExecutionId
      );
      await fetchCanaryResultsService.pollForCanaryExecutionComplete(this.stores.canaryExecutorStore.canaryExecutionId);
    } catch (e) {
      log.error('Failed to fetch response: ', e);
      this.stores.errorStore.push({
        heading: `Failed to fetch response`,
        content: <div></div>
      });
      throw e;
    }
  }

  render(): React.ReactNode {
    return (
      <div className="canary-executor-results-button-section">
        <div className="btn-wrapper">
          <Button
            onClick={() => {
              this.handleRunButtonClick();
            }}
            variant="dark"
          >
            Run Again
          </Button>
        </div>
      </div>
    );
  }
}
