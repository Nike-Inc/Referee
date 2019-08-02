import * as React from 'react';
import { AbstractMetricModal } from '../../components/config/AbstractMetricModal';
import { InlineTextGroup } from '../../layout/InlineTextGroup';
import { FormGroup } from '../../layout/FormGroup';
import { Button, Form } from 'react-bootstrap';
import { boundMethod } from 'autobind-decorator';
import SignalFxCanaryMetricSetQueryConfig from './SignalFxCanaryMetricSetQueryConfig';
import { SIGNAL_FX_SERVICE_TYPE, SUPPORTED_AGGREGATION_METHODS } from './index';
import KeyValuePair from '../../layout/KeyValuePair';

export default class SignalFxMetricModal extends AbstractMetricModal<SignalFxCanaryMetricSetQueryConfig> {
  getQueryInitialState(): SignalFxCanaryMetricSetQueryConfig {
    return {
      type: SIGNAL_FX_SERVICE_TYPE,
      metricName: '',
      aggregationMethod: 'mean',
      queryPairs: []
    };
  }

  @boundMethod
  private handleAddNewDimension(): void {
    const newQueryPairs = this.state.metric.query.queryPairs ? this.state.metric.query.queryPairs.slice() : [];
    newQueryPairs.push({ key: '', value: '' });
    this.updateQueryObject('queryPairs', newQueryPairs);
  }

  @boundMethod
  private handleDimensionKeyChange(index: number, value: string): void {
    if (this.state.metric.query.queryPairs === undefined) {
      return;
    }
    const newQueryPairs = [
      ...this.state.metric.query.queryPairs.slice(0, index),
      Object.assign({}, this.state.metric.query.queryPairs[index], { key: value }),
      ...this.state.metric.query.queryPairs.slice(index + 1)
    ];
    this.updateQueryObject('queryPairs', newQueryPairs);
  }

  @boundMethod
  private handleDimensionValueChange(index: number, value: string): void {
    if (this.state.metric.query.queryPairs === undefined) {
      return;
    }
    const newQueryPairs = [
      ...this.state.metric.query.queryPairs.slice(0, index),
      Object.assign({}, this.state.metric.query.queryPairs[index], { value }),
      ...this.state.metric.query.queryPairs.slice(index + 1)
    ];
    this.updateQueryObject('queryPairs', newQueryPairs);
  }

  @boundMethod
  private handleDimensionDelete(index: number): void {
    if (this.state.metric.query.queryPairs === undefined) {
      return;
    }
    const newQueryPairs = [
      ...this.state.metric.query.queryPairs.slice(0, index),
      ...this.state.metric.query.queryPairs.slice(index + 1)
    ];
    this.updateQueryObject('queryPairs', newQueryPairs);
  }

  getMetricSourceSpecificJsx(): JSX.Element {
    return (
      <div>
        <InlineTextGroup
          onBlur={() => {
            this.touch('metricName');
          }}
          touched={this.state.touched.metricName}
          error={this.state.errors['query.metricName']}
          id="signalfx-metric"
          label="SignalFx Metric"
          value={this.state.metric.query.metricName}
          onChange={e => this.updateQueryObject('metricName', e.target.value)}
          placeHolderText="Metric name, as reported to SignalFx. ex: requests.count"
        />
        <FormGroup
          id="aggregation-method"
          label="Aggregation Method"
          touched={this.state.touched.aggregationMethod}
          error={this.state.errors['query.aggregationMethod']}
        >
          <Form.Control
            as="select"
            value={this.state.metric.query.aggregationMethod}
            onChange={(e: any) => {
              this.updateQueryObject('aggregationMethod', e.target.value);
            }}
          >
            {SUPPORTED_AGGREGATION_METHODS.map(method => (
              <option key={method}>{method}</option>
            ))}
          </Form.Control>
          <Form.Text className="text-muted">
            The aggregation method to reduce multiple time series from multiple instances
          </Form.Text>
        </FormGroup>
        <FormGroup
          id="kv-pairs"
          label="Dimensions"
          touched={this.state.touched.dimensions}
          error={this.state.errors['dimensions']}
        >
          {this.state.metric.query &&
            this.state.metric.query.queryPairs &&
            this.state.metric.query.queryPairs.map((kvPair, i) => (
              <KeyValuePair
                key={i}
                index={i}
                kvPair={kvPair}
                onKeyChange={this.handleDimensionKeyChange}
                onValueChange={this.handleDimensionValueChange}
                handleDelete={this.handleDimensionDelete}
              />
            ))}
          <Button
            onClick={() => {
              this.handleAddNewDimension();
            }}
            size="sm"
            id="add-dimension-btn"
            variant="outline-dark"
          >
            Add Dimension
          </Button>
          <Form.Text className="text-muted">Add additional filters to drill down to the metrics you want</Form.Text>
        </FormGroup>
      </div>
    );
  }
}
